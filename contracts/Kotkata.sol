// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721ABurnable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Kotkata
 * @dev ERC721A NFT contract with OpenSea royalty support and gas-optimized batch minting
 */
contract Kotkata is ERC721A, ERC721ABurnable, ERC2981, Ownable, ReentrancyGuard {
    
    // Constants
    uint256 public constant MAX_BATCH_SIZE = 100;
    
    // Immutable state variables
    uint256 public immutable maxSupply;
    uint96 private immutable _royaltyBasisPoints;
    
    // State variables
    string private _baseTokenURI;
    string private _contractMetadataURI;

    // Events
    event TokenMinted(address indexed to, uint256 indexed tokenId);
    event BatchMinted(address indexed to, uint256 startTokenId, uint256 quantity);
    event TokenBurned(address indexed from, uint256 indexed tokenId);
    event RoyaltyReceiverUpdated(address indexed oldReceiver, address indexed newReceiver);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_,
        uint96 royaltyBasisPoints_,
        address royaltyReceiver_
    ) ERC721A(name_, symbol_) Ownable(msg.sender) {
        require(bytes(baseURI_).length > 0, "Base URI cannot be empty");
        require(maxSupply_ > 0, "Max supply must be greater than 0");
        require(royaltyBasisPoints_ <= 10000, "Royalty cannot exceed 100%");
        require(royaltyReceiver_ != address(0), "Invalid royalty receiver");

        _baseTokenURI = baseURI_;
        maxSupply = maxSupply_;
        _royaltyBasisPoints = royaltyBasisPoints_;
        
        _setDefaultRoyalty(royaltyReceiver_, royaltyBasisPoints_);
    }

    function mint(address to) external onlyOwner nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(_totalMinted() < maxSupply, "Max supply reached");

        uint256 tokenId = _nextTokenId();
        _safeMint(to, 1);
        
        emit TokenMinted(to, tokenId);
    }

    function batchMint(address to, uint256 quantity) external onlyOwner nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(quantity > 0, "Quantity must be greater than 0");
        require(quantity <= MAX_BATCH_SIZE, "Exceeds max batch size");
        require(_totalMinted() + quantity <= maxSupply, "Would exceed max supply");

        uint256 startTokenId = _nextTokenId();
        _safeMint(to, quantity);

        emit BatchMinted(to, startTokenId, quantity);
    }

    function burn(uint256 tokenId) public override {
        super.burn(tokenId);
        emit TokenBurned(msg.sender, tokenId);
    }

    function setRoyaltyReceiver(address newReceiver) external onlyOwner {
        require(newReceiver != address(0), "Invalid royalty receiver");
        
        address oldReceiver = _getDefaultRoyaltyReceiverAddress();
        _setDefaultRoyalty(newReceiver, _royaltyBasisPoints);
        
        emit RoyaltyReceiverUpdated(oldReceiver, newReceiver);
    }

    function setContractURI(string memory contractURI_) external onlyOwner {
        _contractMetadataURI = contractURI_;
    }

    function contractURI() public view returns (string memory) {
        return _contractMetadataURI;
    }

    function getRoyaltyBasisPoints() public view returns (uint96) {
        return _royaltyBasisPoints;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Returns the token URI - combines baseURI + tokenId + ".json"
     * FIXED: Specify which contracts are being overridden
     */
    function tokenURI(uint256 tokenId) public view override(ERC721A, IERC721A) returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        
        string memory baseURI = _baseURI();
        return string(abi.encodePacked(baseURI, _toString(tokenId), ".json"));
    }

    /**
     * @dev Returns total supply (minted - burned)
     * FIXED: Specify which contracts are being overridden
     */
    function totalSupply() public view override(ERC721A, IERC721A) returns (uint256) {
        return super.totalSupply();
    }

    function totalMinted() public view returns (uint256) {
        return _totalMinted();
    }

    function totalBurned() public view returns (uint256) {
        return _totalBurned();
    }

    function remainingSupply() public view returns (uint256) {
        return maxSupply - _totalMinted();
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 0;
    }

    function _getDefaultRoyaltyReceiverAddress() internal view returns (address) {
        (address receiver, ) = royaltyInfo(0, 10000);
        return receiver;
    }

    /**
     * @dev See {IERC165-supportsInterface}
     * FIXED: Removed IERC721A from override list
     */
    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721A, ERC2981, IERC721A)
    returns (bool)
{
    return super.supportsInterface(interfaceId);
}
}
