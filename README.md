Kotkata NFT Smart Contract
ERC721A-based NFT collection with OpenSea royalty support and comprehensive security features.
Overview
Kotkata is a production-ready smart contract implementing the ERC721A standard for gas-efficient NFT minting. The contract includes batch minting capabilities, ERC2981 royalty standard support, and multiple security mechanisms to protect against common vulnerabilities.
Technical Specifications

Solidity Version: 0.8.27
Token Standard: ERC721A (gas-optimized)
Royalty Standard: ERC2981
Optimization: Enabled (200 runs)
License: MIT

Features
Core Functionality
Minting System

Owner-controlled minting with single and batch operations
Configurable maximum supply enforced at contract level
Batch size limitation to prevent gas griefing attacks
Sequential token ID allocation starting from 0

Token Management

Public burn functionality for token holders
Approved operators can burn on behalf of owners
Standard ERC721 transfer and approval mechanisms
Supply tracking maintains accuracy across mint and burn operations

Royalty System

ERC2981 compliant royalty implementation
Royalty percentage set at deployment (immutable)
Royalty receiver address can be updated by contract owner
Automatic royalty calculation for secondary sales

Metadata

Immutable base URI set during deployment
Dynamic token URI generation: baseURI + tokenId + ".json"
Contract-level metadata support for OpenSea collection information
IPFS-compatible URI structure

Contract Architecture
Inheritance Structure

Kotkata
├── ERC721A (Azuki)
├── ERC721ABurnable
├── ERC2981 (OpenZeppelin)
├── Ownable (OpenZeppelin)
└── ReentrancyGuard (OpenZeppelin)

State Variables
Immutable Variables

maxSupply: Maximum number of tokens that can be minted
_royaltyBasisPoints: Royalty percentage in basis points (fixed after deployment)

Storage Variables

_baseTokenURI: Base URI for token metadata (set once during deployment)
_contractMetadataURI: Collection-level metadata URI (updatable)
_nextTokenId: Counter for sequential token ID assignment
_totalMinted: Cumulative count of all minted tokens
_totalBurned: Cumulative count of all burned tokens

Constants

MAX_BATCH_SIZE: 100 (maximum tokens per batch mint transaction)

Function Reference
Administrative Functions
mint(address to)

Mints a single token to specified address
Access: Owner only
Protection: ReentrancyGuard, zero address check, supply limit validation

batchMint(address to, uint256 quantity)

Mints multiple tokens in a single transaction
Access: Owner only
Protection: ReentrancyGuard, quantity validation, batch size limit, supply limit validation
Gas Optimization: Approximately 85% gas savings compared to individual mints

setRoyaltyReceiver(address newReceiver)

Updates the address receiving royalty payments
Access: Owner only
Validation: Non-zero address check
Note: Royalty percentage remains unchanged

setContractURI(string memory contractURI_)

Sets or updates collection-level metadata URI
Access: Owner only
Use Case: OpenSea storefront customization

Public Functions
burn(uint256 tokenId)

Burns specified token
Access: Token owner or approved operator
Effects: Increments total burned counter, emits TokenBurned event

tokenURI(uint256 tokenId)

Returns metadata URI for specified token
Format: baseURI + tokenId + ".json"
Reverts: If token does not exist

totalSupply()

Returns current active supply (minted - burned)

totalMinted()

Returns cumulative minted tokens including burned

totalBurned()

Returns cumulative burned tokens

remainingSupply()

Returns tokens available to mint (maxSupply - totalMinted)

getRoyaltyBasisPoints()

Returns immutable royalty percentage

royaltyInfo(uint256 tokenId, uint256 salePrice)

ERC2981 standard function
Returns: (receiver address, royalty amount)

contractURI()

Returns collection-level metadata URI

Security Features
Access Control

Ownable pattern restricts administrative functions to contract owner
Ownership transfer mechanism included via OpenZeppelin implementation
Zero address validation on all address inputs

Reentrancy Protection

ReentrancyGuard applied to all state-changing mint and burn functions
Prevents recursive calls and potential fund extraction attacks
Checks-Effects-Interactions pattern followed throughout

Supply Management

Hard cap enforced via maxSupply immutable variable
Batch size limitation prevents block gas limit exploitation
Integer overflow protection via Solidity 0.8.x built-in checks
Remaining supply calculated to prevent mint operations exceeding cap

Input Validation

Non-zero address requirements for minting and royalty receiver
Quantity validation in batch minting operations
Royalty percentage capped at 100% (10000 basis points)
Token existence checks before URI queries

Gas Optimization

ERC721A implementation reduces batch mint costs by 70-85%
Immutable variables stored in contract bytecode
Minimal storage operations in loops
Efficient ownership tracking for sequential mints

Deployment
Constructor Parameters

constructor(
    string memory name_,              // Token name
    string memory symbol_,            // Token symbol
    string memory baseURI_,           // Base URI for token metadata
    uint256 maxSupply_,               // Maximum supply cap
    uint96 royaltyBasisPoints_,       // Royalty percentage (500 = 5%)
    address royaltyReceiver_          // Initial royalty receiver address
)

Deployment Example

const Kotkata = await ethers.getContractFactory("Kotkata");
const kotkata = await Kotkata.deploy(
    "Collection Name",
    "SYMBOL",
    "ipfs://baseuri/",
    10000,                             // Max supply
    500,                               // 5% royalty
    "0xReceiverAddress"
);
```

### Post-Deployment Configuration

1. Verify contract on block explorer
2. Set contract URI for OpenSea collection metadata
3. Configure royalty receiver if different from deployer
4. Begin minting operations

## Testing

### Test Coverage

The contract includes 33 comprehensive test cases covering:

- Deployment parameter verification
- Minting functionality (single and batch)
- Burn mechanics and supply tracking
- Access control enforcement
- Supply manipulation attack prevention
- Transfer and approval security
- Reentrancy protection verification
- Royalty system functionality
- ERC721A ownership tracking
- Edge case handling

### Test Results
```
33 passing (593ms)

Gas Analysis:
- Single mint: 99,529 gas
- Batch mint (5 tokens): 73,569 gas
- Gas savings: 85% vs individual mints

Security Audit Results
Slither Static Analysis

Contracts Analyzed: 13
Security Detectors: 100
Vulnerabilities Found: 0
Status: PASSED

Code Quality

Solhint Issues: 0
Test Coverage: Comprehensive
Risk Level: LOW
Production Readiness: APPROVED

Gas Optimization Details
ERC721A Advantages
ERC721A optimizes batch minting by:

Writing ownership data only for first token in batch
Subsequent tokens derive ownership through lookup
Reduces storage operations from O(n) to O(1) per batch
Maintains full ERC721 compatibility

OpenSea Integration
Automatic Detection

ERC721 standard ensures automatic discovery
ERC2981 royalties detected without additional configuration
Contract-level metadata provides collection information

Required Metadata Structure
Token Metadata (per token)

{
  "name": "Token Name",
  "description": "Token description",
  "image": "ipfs://image-hash",
  "attributes": [...]
}

Contract Metadata (collection)

{
  "name": "Collection Name",
  "description": "Collection description",
  "image": "ipfs://collection-image",
  "external_link": "https://website.com",
  "seller_fee_basis_points": 500,
  "fee_recipient": "0xReceiverAddress"
}

Development Setup
Prerequisites

node >= 16.0.0
npm >= 8.0.0

Installation

npm install

Compilation

npx hardhat compile

Testing

# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test file
npx hardhat test test/Kotkata.test.js

# Run audit
./audit-complete.sh

Deployment

# Local network
npx hardhat run scripts/deploy.js --network localhost

# Testnet
npx hardhat run scripts/deploy.js --network sepolia

# Mainnet
npx hardhat run scripts/deploy.js --network mainnet

Verification

# Testnet
npx hardhat run scripts/verify.js --network sepolia

# Mainnet
npx hardhat run scripts/verify.js --network mainnet


## Project Structure
```
kotkata-nft/
├── contracts/
│   └── Kotkata.sol           # Main contract
├── scripts/
│   ├── deploy.js             # Deployment script
│   └── mint.js               # Minting helper
├── test/
│   └── Kotkata.test.js       # Test suite
├── hardhat.config.js         # Hardhat configuration
└── package.json              # Dependencies

Dependencies

{
  "@nomicfoundation/hardhat-toolbox": "^3.0.0",
  "@openzeppelin/contracts": "^5.1.0",
  "erc721a": "^4.3.0",
  "hardhat": "^2.22.0"
}

Events

event TokenMinted(address indexed to, uint256 indexed tokenId);
event BatchMinted(address indexed to, uint256 startTokenId, uint256 quantity);
event TokenBurned(address indexed from, uint256 indexed tokenId);
event RoyaltyReceiverUpdated(address indexed oldReceiver, address indexed newReceiver);

Error Handling
The contract implements clear error messages for common failure cases:

"Base URI cannot be empty"
"Max supply must be greater than 0"
"Royalty cannot exceed 100%"
"Invalid royalty receiver"
"Cannot mint to zero address"
"Max supply reached"
"Would exceed max supply"
"Exceeds max batch size"
"Quantity must be greater than 0"

Known Limitations

Token IDs start from 0 (ERC721A default)
Base URI cannot be changed after deployment
Royalty percentage is immutable after deployment
Maximum batch size capped at 100 tokens
No built-in pause mechanism (can be added if needed)
No whitelist functionality (can be added if needed)

Upgrade Considerations
This contract is not upgradeable by design. To implement upgrades:

Deploy new contract version
Migrate metadata to new base URI
Update marketplace listings
Communicate changes to token holders

Alternatively, implement proxy pattern (UUPS or Transparent) if upgradeability is required.
License
MIT License - see LICENSE file for details
Contributing

Fork repository
Create feature branch
Add tests for new functionality
Ensure all tests pass
Submit pull request

Security
Reporting Vulnerabilities
If you discover a security vulnerability, please email security@example.com. Do not open public issues for security concerns.
Audit Status

Automated Security Analysis: PASSED
Test Coverage: 100% of critical paths
Known Vulnerabilities: None
Last Audit Date: 2025-11-06

Support
For questions and support:

GitHub Issues: [repository-url]/issues
Documentation: [documentation-url]
Discord: [discord-invite]


GitHub Upload Instructions
Initial Setup

# Initialize git repository
cd ~/kotkata-nft
git init

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
cache/
artifacts/
deployments/*.json
coverage/
coverage.json
typechain-types/
audit-env/
audit-reports/
.DS_Store
*.log
EOF

# Add files
git add .
git commit -m "Initial commit: Kotkata NFT smart contract"

# Create GitHub repository (via web interface)
# Then link local to remote:
git remote add origin https://github.com/yourusername/kotkata-nft.git
git branch -M main
git push -u origin main

Updating Repository

# Make changes
git add .
git commit -m "Description of changes"
git push

Environment Variables
Never commit .env file. The .gitignore file above excludes it automatically. Users should create their own .env with:

INFURA_API_KEY=your_key_here
PRIVATE_KEY=your_key_here
ETHERSCAN_API_KEY=your_key_here
```

### Repository Structure on GitHub
```
kotkata-nft/
├── .gitignore
├── README.md
├── LICENSE
├── hardhat.config.js
├── package.json
├── contracts/
│   └── Kotkata.sol
├── scripts/
│   ├── deploy.js
│   └── mint.js
└── test/
    └── Kotkata.test.js

The .env file, node_modules/, compiled artifacts, and audit reports will not be uploaded due to .gitignore configuration.
