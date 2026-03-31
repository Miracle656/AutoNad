// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IPriceFeed.sol";

/// @title LimitOrderBook - On-chain limit orders for AutoNad on Monad
contract LimitOrderBook is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Enums ───────────────────────────────────────────────────────────────
    enum OrderStatus {
        OPEN,
        FILLED,
        CANCELLED
    }

    // ─── Structs ─────────────────────────────────────────────────────────────
    struct Order {
        uint256 id;
        address owner;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 targetPrice;   // 8 decimals, matching Chainlink
        bool isBuyOrder;       // true = buy tokenOut with tokenIn; false = sell tokenIn for tokenOut
        OrderStatus status;
        uint256 createdAt;
        uint256 filledAt;
        uint256 fillPrice;     // actual price at fill
    }

    // ─── State ────────────────────────────────────────────────────────────────
    uint256 public nextOrderId;
    address public agent;
    address public owner;

    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public userOrders;
    mapping(address => address) public priceFeeds; // tokenOut => priceFeed

    // ─── Events ───────────────────────────────────────────────────────────────
    event OrderPlaced(
        uint256 indexed orderId,
        address indexed owner,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 targetPrice,
        bool isBuyOrder
    );
    event OrderFilled(
        uint256 indexed orderId,
        address indexed owner,
        uint256 fillPrice,
        uint256 filledAt
    );
    event OrderCancelled(uint256 indexed orderId, address indexed owner);
    event AgentUpdated(address indexed newAgent);
    event PriceFeedSet(address indexed token, address indexed feed);

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "LOB: not owner");
        _;
    }

    modifier onlyAgent() {
        require(msg.sender == agent, "LOB: not agent");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address _agent) {
        owner = msg.sender;
        agent = _agent;
    }

    // ─── Admin ────────────────────────────────────────────────────────────────
    function setAgent(address _agent) external onlyOwner {
        agent = _agent;
        emit AgentUpdated(_agent);
    }

    function setPriceFeed(address token, address feed) external onlyOwner {
        priceFeeds[token] = feed;
        emit PriceFeedSet(token, feed);
    }

    // ─── Core Order Functions ─────────────────────────────────────────────────

    /// @notice Place a limit order — tokens are locked in the contract
    function placeLimitOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 targetPrice,
        bool isBuyOrder
    ) external nonReentrant returns (uint256 orderId) {
        require(amountIn > 0, "LOB: zero amount");
        require(tokenIn != address(0) && tokenOut != address(0), "LOB: zero address");
        require(targetPrice > 0, "LOB: zero price");

        orderId = nextOrderId++;

        orders[orderId] = Order({
            id: orderId,
            owner: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            targetPrice: targetPrice,
            isBuyOrder: isBuyOrder,
            status: OrderStatus.OPEN,
            createdAt: block.timestamp,
            filledAt: 0,
            fillPrice: 0
        });

        userOrders[msg.sender].push(orderId);

        // Lock tokens in this contract
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        emit OrderPlaced(orderId, msg.sender, tokenIn, tokenOut, amountIn, targetPrice, isBuyOrder);
    }

    /// @notice Cancel an open order — returns tokens to owner
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.owner == msg.sender, "LOB: not order owner");
        require(order.status == OrderStatus.OPEN, "LOB: order not open");

        order.status = OrderStatus.CANCELLED;

        // Return locked tokens
        IERC20(order.tokenIn).safeTransfer(order.owner, order.amountIn);

        emit OrderCancelled(orderId, msg.sender);
    }

    /// @notice Execute an order — called by the agent when price condition is met
    function executeOrder(uint256 orderId) external nonReentrant onlyAgent {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.OPEN, "LOB: order not open");

        // Get current price from feed (if available), else use target price for testnet mock
        uint256 currentPrice = _getCurrentPrice(order.tokenOut);

        // Validate price condition
        if (order.isBuyOrder) {
            // Buy order: execute when current price <= target price
            require(currentPrice <= order.targetPrice, "LOB: price condition not met (buy)");
        } else {
            // Sell order: execute when current price >= target price
            require(currentPrice >= order.targetPrice, "LOB: price condition not met (sell)");
        }

        order.status = OrderStatus.FILLED;
        order.filledAt = block.timestamp;
        order.fillPrice = currentPrice;

        // On testnet, we simulate the swap by returning amountIn back to owner
        // In production, this would call a DEX router
        IERC20(order.tokenIn).safeTransfer(order.owner, order.amountIn);

        emit OrderFilled(orderId, order.owner, currentPrice, block.timestamp);
    }

    /// @notice Force-execute for testnet simulation (agent bypasses price check)
    function executeOrderSimulated(uint256 orderId, uint256 simulatedPrice) external nonReentrant onlyAgent {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.OPEN, "LOB: order not open");

        order.status = OrderStatus.FILLED;
        order.filledAt = block.timestamp;
        order.fillPrice = simulatedPrice;

        IERC20(order.tokenIn).safeTransfer(order.owner, order.amountIn);

        emit OrderFilled(orderId, order.owner, simulatedPrice, block.timestamp);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /// @notice Get all orders for a user
    function getOpenOrders(address user) external view returns (Order[] memory) {
        uint256[] memory ids = userOrders[user];
        uint256 openCount;

        for (uint256 i = 0; i < ids.length; i++) {
            if (orders[ids[i]].status == OrderStatus.OPEN) {
                openCount++;
            }
        }

        Order[] memory openOrders = new Order[](openCount);
        uint256 idx;
        for (uint256 i = 0; i < ids.length; i++) {
            if (orders[ids[i]].status == OrderStatus.OPEN) {
                openOrders[idx++] = orders[ids[i]];
            }
        }
        return openOrders;
    }

    function getAllUserOrders(address user) external view returns (Order[] memory) {
        uint256[] memory ids = userOrders[user];
        Order[] memory allOrders = new Order[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            allOrders[i] = orders[ids[i]];
        }
        return allOrders;
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _getCurrentPrice(address token) internal view returns (uint256) {
        address feed = priceFeeds[token];
        if (feed == address(0)) {
            // No feed set — return 0 to allow testnet simulation
            return 0;
        }
        (, int256 answer, , , ) = IPriceFeed(feed).latestRoundData();
        require(answer > 0, "LOB: invalid price from feed");
        return uint256(answer);
    }
}
