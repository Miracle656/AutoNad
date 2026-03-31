// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title AgentVault - User-controlled vault with agent spending permissions
contract AgentVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ─── Structs ─────────────────────────────────────────────────────────────
    struct AgentPermission {
        uint256 spendingLimit;     // max total spend allowed
        uint256 spentAmount;       // how much has been spent
        uint256 expiresAt;         // unix timestamp — 0 means no expiry
        bool active;
    }

    // ─── State ────────────────────────────────────────────────────────────────
    // user => token => balance
    mapping(address => mapping(address => uint256)) public balances;

    // user => agent => permission
    mapping(address => mapping(address => AgentPermission)) public agentPermissions;

    // ─── Events ───────────────────────────────────────────────────────────────
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdrawal(address indexed user, address indexed token, uint256 amount);
    event AgentApproved(
        address indexed user,
        address indexed agent,
        uint256 spendingLimit,
        uint256 expiresAt
    );
    event AgentRevoked(address indexed user, address indexed agent);
    event AgentTransfer(
        address indexed agent,
        address indexed user,
        address indexed to,
        uint256 amount,
        address token
    );

    // ─── Deposit / Withdraw ───────────────────────────────────────────────────

    /// @notice Deposit ERC20 tokens into the vault
    function deposit(address token, uint256 amount) external nonReentrant {
        require(token != address(0), "Vault: zero address");
        require(amount > 0, "Vault: zero amount");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender][token] += amount;

        emit Deposit(msg.sender, token, amount);
    }

    /// @notice Deposit native MON into the vault (wrapped as address(0) internally)
    receive() external payable {
        balances[msg.sender][address(0)] += msg.value;
        emit Deposit(msg.sender, address(0), msg.value);
    }

    /// @notice Withdraw ERC20 tokens from the vault
    function withdraw(address token, uint256 amount) external nonReentrant {
        require(balances[msg.sender][token] >= amount, "Vault: insufficient balance");

        balances[msg.sender][token] -= amount;

        if (token == address(0)) {
            (bool ok, ) = msg.sender.call{ value: amount }("");
            require(ok, "Vault: ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit Withdrawal(msg.sender, token, amount);
    }

    // ─── Agent Permissions ────────────────────────────────────────────────────

    /// @notice Grant an agent permission to spend vault funds
    function approveAgent(
        address agentAddr,
        uint256 spendingLimit,
        uint256 expiresAt
    ) external {
        require(agentAddr != address(0), "Vault: zero agent");
        require(spendingLimit > 0, "Vault: zero limit");

        agentPermissions[msg.sender][agentAddr] = AgentPermission({
            spendingLimit: spendingLimit,
            spentAmount: 0,
            expiresAt: expiresAt,
            active: true
        });

        emit AgentApproved(msg.sender, agentAddr, spendingLimit, expiresAt);
    }

    /// @notice Revoke agent permission immediately
    function revokeAgent(address agentAddr) external {
        require(agentPermissions[msg.sender][agentAddr].active, "Vault: agent not active");
        agentPermissions[msg.sender][agentAddr].active = false;
        emit AgentRevoked(msg.sender, agentAddr);
    }

    /// @notice Agent calls this to move user funds — enforces spending limits
    function agentTransfer(
        address user,
        address token,
        address to,
        uint256 amount
    ) external nonReentrant {
        AgentPermission storage perm = agentPermissions[user][msg.sender];

        require(perm.active, "Vault: agent not approved");
        require(
            perm.expiresAt == 0 || block.timestamp < perm.expiresAt,
            "Vault: agent permission expired"
        );
        require(
            perm.spentAmount + amount <= perm.spendingLimit,
            "Vault: spending limit exceeded"
        );
        require(balances[user][token] >= amount, "Vault: insufficient user balance");

        perm.spentAmount += amount;
        balances[user][token] -= amount;

        if (token == address(0)) {
            (bool ok, ) = to.call{ value: amount }("");
            require(ok, "Vault: ETH transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }

        emit AgentTransfer(msg.sender, user, to, amount, token);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getBalance(address user, address token) external view returns (uint256) {
        return balances[user][token];
    }

    function getAgentPermission(
        address user,
        address agentAddr
    ) external view returns (AgentPermission memory) {
        return agentPermissions[user][agentAddr];
    }

    function isAgentActive(address user, address agentAddr) external view returns (bool) {
        AgentPermission memory perm = agentPermissions[user][agentAddr];
        if (!perm.active) return false;
        if (perm.expiresAt != 0 && block.timestamp >= perm.expiresAt) return false;
        return true;
    }

    function remainingAgentBudget(
        address user,
        address agentAddr
    ) external view returns (uint256) {
        AgentPermission memory perm = agentPermissions[user][agentAddr];
        if (!perm.active) return 0;
        if (perm.spentAmount >= perm.spendingLimit) return 0;
        return perm.spendingLimit - perm.spentAmount;
    }
}
