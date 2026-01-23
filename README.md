# 🐱 Kotkata by GembaPay

**A limited collection of 10,000 unique hand-drawn Sphynx cat NFTs - Free gifts for GembaPay customers**

[![Ethereum](https://img.shields.io/badge/Ethereum-Mainnet-627EEA?logo=ethereum)](https://etherscan.io/address/0xD24a89dc1686C2F88d33A70250473495459C564a)
[![BSC](https://img.shields.io/badge/BSC-Mainnet-F0B90B?logo=binance)](https://bscscan.com/address/0x8Fee75865E8D87cdB844Ef5676D2D6456262BA7A)
[![Polygon](https://img.shields.io/badge/Polygon-Mainnet-8247E5?logo=polygon)](https://polygonscan.com/address/0xD24a89dc1686C2F88d33A70250473495459C564a)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Overview

Kotkata ("The Cats" in Bulgarian) is a generative art NFT collection featuring unique Sphynx cats with various traits, accessories, and rarities. Each NFT is automatically gifted to customers who complete payments through [GembaPay](https://gembapay.com) - a non-custodial cryptocurrency payment gateway.

###  Key Features

- **10,000 Unique NFTs** - No duplicates, DNA-verified uniqueness
- **Hand-Drawn Artwork** - Original illustrations by Biliana Nikolaeva (Billy)
- **Multi-Chain Deployment** - Available on Ethereum, BSC, and Polygon
- **Gas-Optimized** - ERC721A standard for 70-85% gas savings on batch mints
- **On-Chain Royalties** - ERC2981 standard (5%)
- **Free for Customers** - Gifted after payment completion

---

##  Collection Details

### Artwork

| | |
|---|---|
| **Artist** | Biliana Nikolaeva (Billy) |
| **Style** | Hand-drawn digital illustrations |
| **Subject** | Sphynx cats with various traits |
| **Created** | January 2026 |

### Technical Development

| | |
|---|---|
| **Developer** | Slavcho Ivanov (Slavy) |
| **Generator** | Custom Node.js generative art engine |
| **Image Processing** | Sharp library for layer composition |
| **Resolution** | 1024 × 1024 JPEG |
| **Storage** | IPFS via Filebase (CAR files) |

---

##  Layers & Traits

The collection uses a 7-layer composition system:

| Layer | Options | Examples |
|-------|---------|----------|
| **Background** | 9 | Army Green, Blue, Gray, Punk Blue, Orange, Pink, Purple, Silver, Yellow |
| **Skin** | 10 | Gray, Pink, Brown, Dark Brown, Golden Brown, Black, Blue, Purple, Red, Solid Gold |
| **Body** | 1 | Base Sphynx cat body |
| **Eyes** | 5 | Bored, Closed, Bloodshot, Heart, Coin |
| **Mouth** | 5 | Bored, Small Grin, Surprised, Grin, Rage |
| **Clothes** | 6 | None, Sleeveless Tee, Striped Tee, Guayabera, Hawaiian Shirt, Leather Jacket |
| **Hat** | 6 | None, Beanie, Blue Bandana, Army Hat, Cowboy Hat, Halo |

###  Rarity Distribution

| Rarity | Percentage | Count | Description |
|--------|------------|-------|-------------|
| Common | 45% | 4,500 | Standard trait combinations |
| Uncommon | 25% | 2,500 | One rare trait |
| Rare | 16% | 1,600 | Multiple rare traits |
| Epic | 8% | 800 | Legendary + rare combination |
| Legendary | 4% | 400 | Multiple legendary traits |
| Mythic | 2% | 200 | Ultra-rare combinations |

###  Special Combinations

| Set | Traits | Bonus |
|-----|--------|-------|
| **Army Set** | Army Green background + Army Hat | +10 rarity score |
| **Punk Set** | Punk Blue background + Blue Bandana | +10 rarity score |
| **Golden God** | Solid Gold Skin + Coin Eyes + Halo | Guaranteed Mythic |

---

##  Smart Contract

### Deployed Addresses

| Network | Address | Explorer |
|---------|---------|----------|
| **Ethereum** | `0xD24a89dc1686C2F88d33A70250473495459C564a` | [Etherscan](https://etherscan.io/address/0xD24a89dc1686C2F88d33A70250473495459C564a#code) |
| **BSC** | `0x8Fee75865E8D87cdB844Ef5676D2D6456262BA7A` | [BscScan](https://bscscan.com/address/0x8Fee75865E8D87cdB844Ef5676D2D6456262BA7A#code) |
| **Polygon** | `0xD24a89dc1686C2F88d33A70250473495459C564a` | [PolygonScan](https://polygonscan.com/address/0xD24a89dc1686C2F88d33A70250473495459C564a#code) |

### Technical Specifications

| Property | Value |
|----------|-------|
| **Token Standard** | ERC721A (gas-optimized) |
| **Royalty Standard** | ERC2981 |
| **Solidity Version** | 0.8.27 |
| **Max Supply** | 10,000 |
| **Royalty** | 5% |
| **Max Batch Size** | 100 tokens |
| **License** | MIT |

### Contract Features

-  **ERC721A** - Gas-optimized batch minting (70-85% savings)
-  **ERC2981** - On-chain royalties for marketplace support
-  **Signature Minting** - Backend-authorized minting with replay protection
-  **Batch Operations** - Mint, transfer, burn up to 100 NFTs per transaction
-  **ReentrancyGuard** - Protection against reentrancy attacks
-  **Access Control** - Owner-only administrative functions

### Inheritance Structure

```
Kotkata
├── ERC721A (Azuki)
├── ERC721ABurnable
├── ERC2981 (OpenZeppelin)
├── Ownable (OpenZeppelin)
└── ReentrancyGuard (OpenZeppelin)
```

---

##  IPFS Storage

| Content | CID | Gateway |
|---------|-----|---------|
| **Images** | `bafybeihblwcb2mp6cyjj3vmpm4agzdilpzx6ia7xahhubfqszkbzj3qvdm` | [View](https://ipfs.filebase.io/ipfs/bafybeihblwcb2mp6cyjj3vmpm4agzdilpzx6ia7xahhubfqszkbzj3qvdm/0.jpg) |
| **Metadata** | `bafybeiaoqjtxd7ptabsz67afmenvuf45tgqlwgorjttkaz7zxkmvjuoeqa` | [View](https://ipfs.filebase.io/ipfs/bafybeiaoqjtxd7ptabsz67afmenvuf45tgqlwgorjttkaz7zxkmvjuoeqa/0.json) |

**Base URI:** `ipfs://bafybeiaoqjtxd7ptabsz67afmenvuf45tgqlwgorjttkaz7zxkmvjuoeqa/`

### Metadata Format

```json
{
  "name": "Kotkata #0",
  "description": "A unique Sphynx cat from the Kotkata collection...",
  "image": "ipfs://bafybeihblwcb2mp6cyjj3vmpm4agzdilpzx6ia7xahhubfqszkbzj3qvdm/0.jpg",
  "attributes": [
    { "trait_type": "Background", "value": "Pink" },
    { "trait_type": "Skin", "value": "Gray" },
    { "trait_type": "Eyes", "value": "Bored" },
    { "trait_type": "Mouth", "value": "Grin" },
    { "trait_type": "Clothes", "value": "Hawaiian Shirt" },
    { "trait_type": "Hat", "value": "Beanie" },
    { "trait_type": "Rarity", "value": "Common" },
    { "display_type": "number", "trait_type": "Rarity Score", "value": 12 }
  ]
}
```

---

##  Security

### Audit Results

| Tool | Status | Issues |
|------|--------|--------|
| **Slither** |  PASSED | 0 vulnerabilities |
| **Solhint** |  PASSED | 0 critical issues |
| **Test Suite** |  PASSED | 33 tests passing |

### Security Features

- **Access Control** - Owner-only minting and admin functions
- **Reentrancy Protection** - ReentrancyGuard on all state-changing functions
- **Supply Management** - Hard cap enforced, batch size limited
- **Input Validation** - Zero address checks, quantity limits
- **Signature Verification** - ECDSA with replay protection

---

##  Development

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

```bash
git clone https://github.com/ivanovslavy/kotkata-nft.git
cd kotkata-nft
npm install
```

### Configuration

Create `.env` file:

```env
INFURA_API_KEY=your_infura_key
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Commands

```bash
# Compile
npx hardhat compile

# Test
npx hardhat test

# Test with gas reporting
REPORT_GAS=true npx hardhat test

# Deploy
npx hardhat run scripts/deploy.js --network <network>

# Verify
npx hardhat verify --network <network> <address> <constructor_args>

# Security Audit
./audit-complete.sh
```

---

##  Project Structure

```
kotkata-nft/
├── contracts/
│   └── Kotkata.sol           # Main NFT contract
├── scripts/
│   ├── deploy.js             # Deployment script
│   ├── verify.js             # Verification script
│   └── mint.js               # Minting helper
├── test/
│   └── Kotkata.test.js       # Test suite (33 tests)
├── deployments/              # Deployment logs
├── audit-reports/            # Security audit results
├── hardhat.config.js
├── package.json
├── LICENSE
└── README.md
```

---

##  Links

| Resource | URL |
|----------|-----|
| **Website** | [gembapay.com/nft-gift](https://gembapay.com/nft-gift) |
| **GembaPay** | [gembapay.com](https://gembapay.com) |
| **OpenSea (Ethereum)** | Coming Soon |
| **OpenSea (Polygon)** | Coming Soon |

---

##  Credits

| Role | Name |
|------|------|
| **Artwork** | Biliana Nikolaeva (Billy) |
| **Smart Contract & Generator** | Slavcho Ivanov (Slavy) |
| **Sponsor** | [GembaPay](https://gembapay.com) - Gemba EOOD |

---

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

##  Support

- **GitHub Issues:** [Open an issue](https://github.com/ivanovslavy/kotkata-nft/issues)
- **Email:** support@gembapay.com

---

<p align="center">
  <b>🐱 Kotkata by GembaPay - Free NFT gifts for every payment! 🐱</b>
</p>
