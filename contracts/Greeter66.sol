//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Greeter55 {
    string private greeting;
    int private ourNum;

    constructor(string memory _greeting, int _ourNum) {
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
        ourNum = _ourNum;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }
}
