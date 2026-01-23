// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721ABurnable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title Kotkata by GembaPay
 * @author Gemba EOOD (https://gembapay.com)
 * @notice A limited collection of 10,000 unique Sphynx cat NFTs - Free gifts for GembaPay customers
 * @dev Hand-drawn artwork by Biliana Nikolaeva (Billy), generative engine by Slavy
 
 * * ═══════════════════════════════════════════════════════════════════════════════
 *   COLLECTION INFO
 *   ═══════════════════════════════════════════════════════════════════════════════
 
 * * Artwork:
 * - Artist: Biliana Nikolaeva (Billy)
 * - Style: Hand-drawn digital illustrations
 * - Subject: Sphynx cats with various traits and accessories
 * - Created: January 2026
 
 * * Technical Development:
 
 * - Developer: Slavcho Ivanov (Slavy)
 * - Generator: Custom Node.js generative art engine
 * - Image Processing: Sharp library for layer composition
 * - Storage: IPFS via Filebase (CAR files)
 
 * * Generative Art System:
 
 * - Total Supply: 10,000 unique NFTs
 * - Layers (bottom to top): Background → Skin → Body → Eyes → Mouth → Clothes → Hat
 * - Layer Composition: 7 layers combined into 1024x1024 JPEG images
 * - Uniqueness: DNA hash verification ensures no duplicates
 
 * * Layer Details:
 
 * - Backgrounds: 9 colors (Army Green, Blue, Gray, Punk Blue, Orange, Pink, Purple, Silver, Yellow)
 * - Skins: 10 types (Gray, Pink, Brown, Dark Brown, Golden Brown, Black, Blue, Purple, Red, Solid Gold)
 * - Eyes: 5 types (Bored, Closed, Bloodshot, Heart, Coin)
 * - Mouths: 5 types (Bored, Small Grin, Surprised, Grin, Rage)
 * - Clothes: 6 options (None, Sleeveless Tee, Striped Tee, Guayabera, Hawaiian Shirt, Leather Jacket)
 * - Hats: 6 options (None, Beanie, Blue Bandana, Army Hat, Cowboy Hat, Halo)
 
 * * Rarity System (Quota-based):
 
 * - Common: 45% (4,500 NFTs)
 * - Uncommon: 25% (2,500 NFTs)
 * - Rare: 16% (1,600 NFTs)
 * - Epic: 8% (800 NFTs)
 * - Legendary: 4% (400 NFTs)
 * - Mythic: 2% (200 NFTs)
 
 * * Special Combinations:
 
 * - Army Set: Army Green background + Army Hat
 * - Punk Set: Punk Blue background + Blue Bandana
 * - Golden God: Solid Gold Skin + Coin Eyes + Halo (Ultra Rare)
 
 * * Forbidden Combinations (for aesthetic reasons):
 
 * - Halo + Rage mouth (angels don't rage)
 * - Halo + Bloodshot eyes (angels don't get high)
 * - Solid Gold Skin + basic tees (gold deserves better)
 * - Yellow background + yellow/gold elements (contrast)
 
 * * ═══════════════════════════════════════════════════════════════════════════════
 *   SMART CONTRACT
 *   ═══════════════════════════════════════════════════════════════════════════════
 
 * * Core Features:
 
 * - ERC721A: Gas-optimized batch minting (up to 1,000 in single tx)
 * - ERC2981: On-chain royalties (5.0%) for OpenSea and marketplaces
 * - Signature Minting: Backend-authorized minting after payment confirmation
 * - Batch Operations: Transfer and burn up to 100 NFTs per transaction
 
 * * Security:
 
 * - OpenZeppelin ReentrancyGuard, Ownable
 * - ECDSA signature verification with replay protection
 * - Front-running protection on batch operations
 * - Blocks incoming ETH, ERC20, ERC721, ERC1155 transfers
 
 * * Integration with GembaPay:
 
 * - Customers receive free NFT after completing any payment (crypto/Stripe/PayPal)
 * - Backend signs minting authorization with orderId and nonce
 * - One NFT per payment (signature replay protection)
 
 * * IPFS Storage:
 
 * - Images: ipfs://bafybeihblwcb2mp6cyjj3vmpm4agzdilpzx6ia7xahhubfqszkbzj3qvdm/
 * - Metadata: ipfs://bafybeiaoqjtxd7ptabsz67afmenvuf45tgqlwgorjttkaz7zxkmvjuoeqa/
 * - Provider: Filebase (CAR file upload)
 * - Format: tokenId.json referencing tokenId.jpg
 
 * * URI Format: baseURI + tokenId + ".json" (e.g., 0.json, 1.json, ... 9999.json)
 
 * * @custom:artist Biliana Nikolaeva (Billy) - Hand-drawn artwork
 * @custom:developer Slavcho-Ivanov-Slavy - Smart contract and generative engine
 * @custom:sponsor-owner GembaPay - Non-custodial payment gateway
 * @custom:website https://gembapay.com/nft-gift
 * @custom:github https://github.com/ivanovslavy/kotkata-nft
 */
 
contract Kotkata is ERC721A, ERC721ABurnable, ERC2981, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    mapping(bytes32 => bool) public usedSignatures;
    mapping(bytes32 => bool) public usedOrders;
        
    // Constants
    uint256 public constant MAX_BATCH_SIZE = 1000;
    uint256 public constant MAX_BATCH_TRANSFER = 100;
    uint256 public constant MAX_BATCH_BURN = 100;
    
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
    event BatchTransferByID(address indexed from, address indexed to, uint256[] tokenIds);
    event BatchTransferByNumber(address indexed from, address indexed to, uint256 startId, uint256 count);
    event BatchBurned(address indexed burner, uint256[] tokenIds, uint256 count);
    
    // Custom errors
    error NoNativeTokensAccepted();
    error NoERC20TokensAccepted();
    error NoERC721TokensAccepted();
    error NoERC1155TokensAccepted();

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

    // ========== MINTING FUNCTIONS ==========

    function mint(address to) external onlyOwner nonReentrant {
        require(to != address(0), "Cannot mint to zero address");
        require(_totalMinted() < maxSupply, "Max supply reached");

        uint256 tokenId = _nextTokenId();
        _safeMint(to, 1);
        
        emit TokenMinted(to, tokenId);
    }

    function mintWithSignature(
        address to,
        bytes32 orderId,
        uint256 nonce,
        bytes memory signature
        ) external nonReentrant {
        
        // Create message hash
        bytes32 messageHash = keccak256(abi.encodePacked(to, orderId, nonce));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        // Verify signature
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == owner(), "Invalid signature");
        require(!usedSignatures[ethSignedMessageHash], "Signature already used");
        
        // Mark as used
        usedSignatures[ethSignedMessageHash] = true;
        usedOrders[orderId] = true;
        
        // Mint
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

    // ========== BATCH TRANSFER FUNCTIONS (PUBLIC) ==========

    /**
     * @dev Batch transfer specific token IDs to recipient (PUBLIC)
     * @param to Recipient address
     * @param tokenIds Array of specific token IDs to transfer
     */
    function batchTransferByID(address to, uint256[] calldata tokenIds) 
        external 
        nonReentrant 
    {
        require(to != address(0), "Invalid recipient");
        require(tokenIds.length > 0, "Empty array");
        require(tokenIds.length <= MAX_BATCH_TRANSFER, "Exceeds max batch transfer size");
        
        // Front-running protection: validate all tokens owned by caller first
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(_exists(tokenIds[i]), "Token does not exist");
            address tokenOwner = ownerOf(tokenIds[i]);
            require(
                tokenOwner == msg.sender || 
                getApproved(tokenIds[i]) == msg.sender ||
                isApprovedForAll(tokenOwner, msg.sender),
                "Not owner or approved"
            );
        }
        
        // Execute transfers after validation
        for (uint256 i = 0; i < tokenIds.length; i++) {
            address from = ownerOf(tokenIds[i]);
            safeTransferFrom(from, to, tokenIds[i]);
        }
        
        emit BatchTransferByID(msg.sender, to, tokenIds);
    }

    /**
     * @dev Batch transfer sequential tokens starting from specific ID (PUBLIC)
     * @param to Recipient address
     * @param startId Starting token ID number
     * @param count Number of sequential tokens to transfer
     */
    function batchTransferByNumber(address to, uint256 startId, uint256 count) 
        external 
        nonReentrant 
    {
        require(to != address(0), "Invalid recipient");
        require(count > 0, "Count must be greater than 0");
        require(count <= MAX_BATCH_TRANSFER, "Exceeds max batch transfer size");
        
        // Front-running protection: validate all tokens first
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = startId + i;
            require(_exists(tokenId), "Token does not exist");
            address tokenOwner = ownerOf(tokenId);
            require(
                tokenOwner == msg.sender || 
                getApproved(tokenId) == msg.sender ||
                isApprovedForAll(tokenOwner, msg.sender),
                "Not owner or approved"
            );
        }
        
        // Execute transfers after validation
        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = startId + i;
            address from = ownerOf(tokenId);
            safeTransferFrom(from, to, tokenId);
        }
        
        emit BatchTransferByNumber(msg.sender, to, startId, count);
    }

    // ========== BATCH BURN FUNCTION (PUBLIC) ==========

    /**
     * @dev Public batch burn - burn multiple NFTs at once
     * @param tokenIds Array of token IDs to burn
     */
    function batchBurn(uint256[] calldata tokenIds) 
        external 
        nonReentrant 
    {
        require(tokenIds.length > 0, "Empty array");
        require(tokenIds.length <= MAX_BATCH_BURN, "Exceeds max batch burn size");
        
        // Front-running protection: validate ownership first
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(_exists(tokenIds[i]), "Token does not exist");
            address tokenOwner = ownerOf(tokenIds[i]);
            require(
                tokenOwner == msg.sender || 
                getApproved(tokenIds[i]) == msg.sender ||
                isApprovedForAll(tokenOwner, msg.sender),
                "Not owner or approved"
            );
        }
        
        // Execute burns after validation
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _burn(tokenIds[i]);
        }
        
        emit BatchBurned(msg.sender, tokenIds, tokenIds.length);
    }

    // ========== BURNING FUNCTION (Original) ==========

    function burn(uint256 tokenId) public override {
        super.burn(tokenId);
        emit TokenBurned(msg.sender, tokenId);
    }

    // ========== ROYALTY MANAGEMENT ==========

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

    // ========== URI FUNCTIONS ==========

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721A, IERC721A) returns (string memory) {
    if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
    
    string memory baseURI = _baseURI();
    return string(abi.encodePacked(baseURI, _toString(tokenId), ".json"));
    }

    // ========== SUPPLY TRACKING ==========

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

    // ========== INTERFACE SUPPORT ==========

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721A, ERC2981, IERC721A)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ========== BLOCK ALL TOKEN RECEIPTS ==========

    /**
     * @dev Block receiving native ETH
     */
    receive() external payable {
        revert NoNativeTokensAccepted();
    }

    /**
     * @dev Block receiving ETH via fallback
     */
    fallback() external payable {
        revert NoNativeTokensAccepted();
    }

    /**
     * @dev Block receiving ERC20 tokens
     * Note: This doesn't fully prevent ERC20 transfers but signals intent
     */
    function onERC20Received(
        address,
        address,
        uint256,
        bytes memory
    ) external pure returns (bytes4) {
        revert NoERC20TokensAccepted();
    }

    /**
     * @dev Block receiving ERC721 tokens (except during minting)
     */
    function onERC721Received(
        address operator,
        address from,
        uint256,
        bytes memory
    ) external view returns (bytes4) {
        // Allow receiving only during minting (from == address(0))
        // or when operator is this contract itself
        if (from == address(0) || operator == address(this)) {
            return this.onERC721Received.selector;
        }
        revert NoERC721TokensAccepted();
    }

    /**
     * @dev Block receiving ERC1155 tokens
     */
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) external pure returns (bytes4) {
        revert NoERC1155TokensAccepted();
    }

    /**
     * @dev Block receiving ERC1155 batch tokens
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) external pure returns (bytes4) {
        revert NoERC1155TokensAccepted();
    }
}
