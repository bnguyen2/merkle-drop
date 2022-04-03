//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ShipToken
/// @author Melvillian
/// @notice A simple ERC20 token that will distributed in an Airdrop
contract ShipyardToken is ERC20 {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        _mint(msg.sender, 500_000 ether);
    }
}
