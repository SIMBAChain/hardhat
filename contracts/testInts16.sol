//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

contract TestInts16 {
    int public int1;
    int private int2;
    string private ourString;

    constructor(int _int1, int _int2, string memory _ourString) {
        // console.log("Deploying a Greeter with greeting:", _greeting);
        int1 = _int1;
        int2 = _int2;
        ourString = _ourString;
    }
}
