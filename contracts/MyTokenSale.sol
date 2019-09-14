/*
 1. Provision tokens to token sale contract
 2. Set a Token price in WEI
 3. Assign an Admin
 4. Buy Tokens
 5. End Sale
 */
 pragma solidity ^0.5.0;

import "./MyToken.sol";

contract MyTokenSale {
    address payable admin;
    MyToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    event Sell(address _buyer, uint256 _numberOfTokens);
    constructor(MyToken _tokenContract, uint256 _tokenPrice) public {
        // Assign an admin
        admin = msg.sender;
        // Token Contract
        tokenContract = _tokenContract;
        // Token Price
        tokenPrice = _tokenPrice;
    }
    // Multiply
    function multiply(uint x, uint y) internal pure returns (uint z){
        require(y==0 || (z = x*y) / y == x);
    }
    // Buy Token
    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require that value is equal to tokens
        require(msg.value == _numberOfTokens * tokenPrice, 'should value is equal to tokens price');
        // Reqquire that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require that a transfer is successful
        require(tokenContract.transfer(msg.sender,_numberOfTokens));
        // Keep track of tokensSold
        tokensSold += _numberOfTokens;
        // Trigger sell Event
       emit Sell(msg.sender, _numberOfTokens);
    }

    // End token MyTokenSale 
    function endSale() public {
        // sender can only do
        require(msg.sender == admin,'Only Admin can destroy the token sale');
        // Transfer remaining token to admin
        require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));
        // Destroy contract
        //selfdestruct(admin);
        // UPDATE: Let's not destroy the contract here
        // Just transfer the balance to the admin
        admin.transfer(address(this).balance);
    }

}
