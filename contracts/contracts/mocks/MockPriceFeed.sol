// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IPriceFeed.sol";

/// @title MockPriceFeed - Simulated Chainlink price feed for Monad testnet
contract MockPriceFeed is IPriceFeed {
    uint8 private _decimals;
    string private _description;
    int256 private _price;
    uint80 private _roundId;
    address public owner;

    event PriceUpdated(int256 newPrice, uint80 roundId);

    modifier onlyOwner() {
        require(msg.sender == owner, "MockPriceFeed: not owner");
        _;
    }

    constructor(
        int256 initialPrice,
        uint8 decimalsValue,
        string memory desc
    ) {
        _price = initialPrice;
        _decimals = decimalsValue;
        _description = desc;
        _roundId = 1;
        owner = msg.sender;
    }

    function setPrice(int256 newPrice) external onlyOwner {
        _roundId++;
        _price = newPrice;
        emit PriceUpdated(newPrice, _roundId);
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (_roundId, _price, block.timestamp, block.timestamp, _roundId);
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function description() external view override returns (string memory) {
        return _description;
    }
}
