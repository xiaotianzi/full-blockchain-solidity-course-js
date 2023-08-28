// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.19;

contract RandomIpfsNft is ERC721 {
    constructor() ERC721("", "") {}
}
