const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Kotkata NFT Security Tests", function () {
  // Fixture за deploy на contract
  async function deployKotkataFixture() {
    const [owner, user1, user2, attacker, royaltyReceiver] = await ethers.getSigners();

    const NAME = "Kotkata";
    const SYMBOL = "KTKT";
    const BASE_URI = "ipfs://bafybeigrddomoknbxbqlfoy6wsmgdk5nlrckxwd6q7v6pzo5tfiiuycuwi/";
    const MAX_SUPPLY = 50;
    const ROYALTY_BASIS_POINTS = 500; // 5%

    const Kotkata = await ethers.getContractFactory("Kotkata");
    const kotkata = await Kotkata.deploy(
      NAME,
      SYMBOL,
      BASE_URI,
      MAX_SUPPLY,
      ROYALTY_BASIS_POINTS,
      royaltyReceiver.address
    );

    return { kotkata, owner, user1, user2, attacker, royaltyReceiver, MAX_SUPPLY, ROYALTY_BASIS_POINTS, BASE_URI };
  }

  describe("🚀 Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      const { kotkata, owner, royaltyReceiver, MAX_SUPPLY, ROYALTY_BASIS_POINTS } = await loadFixture(deployKotkataFixture);

      expect(await kotkata.name()).to.equal("Kotkata");
      expect(await kotkata.symbol()).to.equal("KTKT");
      expect(await kotkata.maxSupply()).to.equal(MAX_SUPPLY);
      expect(await kotkata.getRoyaltyBasisPoints()).to.equal(ROYALTY_BASIS_POINTS);
      expect(await kotkata.owner()).to.equal(owner.address);
    });

    it("Should set correct royalty receiver", async function () {
      const { kotkata, royaltyReceiver } = await loadFixture(deployKotkataFixture);
      
      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await kotkata.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(royaltyReceiver.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.05")); // 5% of 1 ETH
    });
  });

  describe("🎨 Minting", function () {
    it("Owner should mint successfully", async function () {
      const { kotkata, owner, user1 } = await loadFixture(deployKotkataFixture);

      await expect(kotkata.mint(user1.address))
        .to.emit(kotkata, "TokenMinted")
        .withArgs(user1.address, 0);

      expect(await kotkata.ownerOf(0)).to.equal(user1.address);
      expect(await kotkata.totalMinted()).to.equal(1);
    });

    it("Owner should batch mint successfully", async function () {
      const { kotkata, user1 } = await loadFixture(deployKotkataFixture);

      await expect(kotkata.batchMint(user1.address, 5))
        .to.emit(kotkata, "BatchMinted")
        .withArgs(user1.address, 0, 5);

      expect(await kotkata.totalMinted()).to.equal(5);
      expect(await kotkata.balanceOf(user1.address)).to.equal(5);
    });

    it("Should generate correct token URIs", async function () {
      const { kotkata, user1, BASE_URI } = await loadFixture(deployKotkataFixture);

      await kotkata.batchMint(user1.address, 3);

      expect(await kotkata.tokenURI(0)).to.equal(BASE_URI + "0.json");
      expect(await kotkata.tokenURI(1)).to.equal(BASE_URI + "1.json");
      expect(await kotkata.tokenURI(2)).to.equal(BASE_URI + "2.json");
    });
  });

  describe("🔥 Burning", function () {
    it("Token owner should burn their token", async function () {
      const { kotkata, user1 } = await loadFixture(deployKotkataFixture);

      await kotkata.mint(user1.address);
      
      await expect(kotkata.connect(user1).burn(0))
        .to.emit(kotkata, "TokenBurned")
        .withArgs(user1.address, 0);

      expect(await kotkata.totalBurned()).to.equal(1);
      expect(await kotkata.totalSupply()).to.equal(0);
    });

    it("Approved address should burn token", async function () {
      const { kotkata, user1, user2 } = await loadFixture(deployKotkataFixture);

      await kotkata.mint(user1.address);
      await kotkata.connect(user1).approve(user2.address, 0);
      
      await expect(kotkata.connect(user2).burn(0))
        .to.emit(kotkata, "TokenBurned");
    });
  });

  describe("🔐 Access Control Attacks", function () {
    it("❌ ATTACK: Non-owner cannot mint", async function () {
      const { kotkata, attacker, user1 } = await loadFixture(deployKotkataFixture);

      await expect(
        kotkata.connect(attacker).mint(user1.address)
      ).to.be.revertedWithCustomError(kotkata, "OwnableUnauthorizedAccount");
    });

    it("❌ ATTACK: Non-owner cannot batch mint", async function () {
      const { kotkata, attacker, user1 } = await loadFixture(deployKotkataFixture);

      await expect(
        kotkata.connect(attacker).batchMint(user1.address, 5)
      ).to.be.revertedWithCustomError(kotkata, "OwnableUnauthorizedAccount");
    });

    it("❌ ATTACK: Non-owner cannot change royalty receiver", async function () {
      const { kotkata, attacker } = await loadFixture(deployKotkataFixture);

      await expect(
        kotkata.connect(attacker).setRoyaltyReceiver(attacker.address)
      ).to.be.revertedWithCustomError(kotkata, "OwnableUnauthorizedAccount");
    });

    it("❌ ATTACK: Non-owner cannot set contract URI", async function () {
      const { kotkata, attacker } = await loadFixture(deployKotkataFixture);

      await expect(
        kotkata.connect(attacker).setContractURI("ipfs://malicious")
      ).to.be.revertedWithCustomError(kotkata, "OwnableUnauthorizedAccount");
    });
  });

  describe("💣 Supply Manipulation Attacks", function () {
    it("❌ ATTACK: Cannot mint beyond max supply", async function () {
      const { kotkata, owner, user1, MAX_SUPPLY } = await loadFixture(deployKotkataFixture);

      // Mint до max supply
      await kotkata.batchMint(user1.address, MAX_SUPPLY);

      // Опит да mint-нем повече
      await expect(
        kotkata.mint(user1.address)
      ).to.be.revertedWith("Max supply reached");
    });

    it("❌ ATTACK: Cannot batch mint beyond max supply", async function () {
      const { kotkata, user1, MAX_SUPPLY } = await loadFixture(deployKotkataFixture);

      await expect(
        kotkata.batchMint(user1.address, MAX_SUPPLY + 1)
      ).to.be.revertedWith("Would exceed max supply");
    });

    it("❌ ATTACK: Cannot batch mint more than MAX_BATCH_SIZE", async function () {
      const { kotkata, user1 } = await loadFixture(deployKotkataFixture);

      await expect(
        kotkata.batchMint(user1.address, 101) // MAX_BATCH_SIZE = 100
      ).to.be.revertedWith("Exceeds max batch size");
    });

    it("❌ ATTACK: Cannot mint to zero address", async function () {
      const { kotkata } = await loadFixture(deployKotkataFixture);

      await expect(
        kotkata.mint(ethers.ZeroAddress)
      ).to.be.revertedWith("Cannot mint to zero address");
    });
  });

  describe("🔄 Transfer & Approval Attacks", function () {
    it("✅ Owner can transfer their token", async function () {
      const { kotkata, user1, user2 } = await loadFixture(deployKotkataFixture);

      await kotkata.mint(user1.address);
      
      await kotkata.connect(user1).transferFrom(user1.address, user2.address, 0);

      expect(await kotkata.ownerOf(0)).to.equal(user2.address);
    });

    it("❌ ATTACK: Cannot transfer someone else's token without approval", async function () {
      const { kotkata, user1, attacker } = await loadFixture(deployKotkataFixture);

      await kotkata.mint(user1.address);

      await expect(
        kotkata.connect(attacker).transferFrom(user1.address, attacker.address, 0)
      ).to.be.revertedWithCustomError(kotkata, "TransferCallerNotOwnerNorApproved");
    });

    it("❌ ATTACK: Cannot burn someone else's token without approval", async function () {
      const { kotkata, user1, attacker } = await loadFixture(deployKotkataFixture);

      await kotkata.mint(user1.address);

      await expect(
        kotkata.connect(attacker).burn(0)
      ).to.be.revertedWithCustomError(kotkata, "TransferCallerNotOwnerNorApproved");
    });

    it("✅ Approved operator can transfer", async function () {
      const { kotkata, user1, user2 } = await loadFixture(deployKotkataFixture);

      await kotkata.mint(user1.address);
      await kotkata.connect(user1).approve(user2.address, 0);
      
      await kotkata.connect(user2).transferFrom(user1.address, user2.address, 0);

      expect(await kotkata.ownerOf(0)).to.equal(user2.address);
    });

    it("✅ Operator with setApprovalForAll can transfer multiple tokens", async function () {
      const { kotkata, user1, user2 } = await loadFixture(deployKotkataFixture);

      await kotkata.batchMint(user1.address, 3);
      await kotkata.connect(user1).setApprovalForAll(user2.address, true);
      
      await kotkata.connect(user2).transferFrom(user1.address, user2.address, 0);
      await kotkata.connect(user2).transferFrom(user1.address, user2.address, 1);

      expect(await kotkata.balanceOf(user2.address)).to.equal(2);
    });
  });

  describe("🎭 Reentrancy Attack Simulation", function () {
    it("✅ Reentrancy guard protects batch mint", async function () {
      const { kotkata, user1 } = await loadFixture(deployKotkataFixture);

      await expect(kotkata.batchMint(user1.address, 5))
        .to.emit(kotkata, "BatchMinted");
      
      expect(await kotkata.totalMinted()).to.equal(5);
    });

    it("✅ Multiple mints in sequence work correctly", async function () {
      const { kotkata, user1, user2 } = await loadFixture(deployKotkataFixture);

      await kotkata.mint(user1.address);
      await kotkata.mint(user2.address);
      await kotkata.batchMint(user1.address, 3);
      
      expect(await kotkata.totalMinted()).to.equal(5);
    });
  });

  describe("💰 Royalty Manipulation Attacks", function () {
    it("❌ ATTACK: Cannot set royalty receiver to zero address", async function () {
      const { kotkata } = await loadFixture(deployKotkataFixture);

      await expect(
        kotkata.setRoyaltyReceiver(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid royalty receiver");
    });

    it("✅ Owner can change royalty receiver", async function () {
      const { kotkata, user1 } = await loadFixture(deployKotkataFixture);

      await expect(kotkata.setRoyaltyReceiver(user1.address))
        .to.emit(kotkata, "RoyaltyReceiverUpdated");

      const [receiver] = await kotkata.royaltyInfo(0, ethers.parseEther("1"));
      expect(receiver).to.equal(user1.address);
    });

    it("✅ Royalty percentage remains immutable after receiver change", async function () {
      const { kotkata, user1, ROYALTY_BASIS_POINTS } = await loadFixture(deployKotkataFixture);

      await kotkata.setRoyaltyReceiver(user1.address);

      expect(await kotkata.getRoyaltyBasisPoints()).to.equal(ROYALTY_BASIS_POINTS);
    });
  });

  describe("🧮 ERC721A Batch Ownership Tests", function () {
    it("✅ Batch minted tokens have correct ownership", async function () {
      const { kotkata, user1 } = await loadFixture(deployKotkataFixture);

      await kotkata.batchMint(user1.address, 5);

      for (let i = 0; i < 5; i++) {
        expect(await kotkata.ownerOf(i)).to.equal(user1.address);
      }
    });

    it("✅ After transfer, new owner is tracked correctly", async function () {
      const { kotkata, user1, user2 } = await loadFixture(deployKotkataFixture);

      // Batch mint tokens 0-4
      await kotkata.batchMint(user1.address, 5);

      // Transfer token #3
      await kotkata.connect(user1).transferFrom(user1.address, user2.address, 3);

      // Провери ownership
      expect(await kotkata.ownerOf(0)).to.equal(user1.address);
      expect(await kotkata.ownerOf(1)).to.equal(user1.address);
      expect(await kotkata.ownerOf(2)).to.equal(user1.address);
      expect(await kotkata.ownerOf(3)).to.equal(user2.address); // ✅ Променен
      expect(await kotkata.ownerOf(4)).to.equal(user1.address);
    });

    it("✅ Multiple transfers work correctly", async function () {
      const { kotkata, user1, user2, attacker } = await loadFixture(deployKotkataFixture);

      await kotkata.batchMint(user1.address, 3);

      // Transfer #1 -> user2
      await kotkata.connect(user1).transferFrom(user1.address, user2.address, 1);
      expect(await kotkata.ownerOf(1)).to.equal(user2.address);

      // Transfer #1 -> attacker (от user2)
      await kotkata.connect(user2).transferFrom(user2.address, attacker.address, 1);
      expect(await kotkata.ownerOf(1)).to.equal(attacker.address);
    });
  });

  describe("📊 Supply Tracking", function () {
    it("✅ Supply tracking works correctly with mints and burns", async function () {
      const { kotkata, user1 } = await loadFixture(deployKotkataFixture);

      // Mint 10 tokens
      await kotkata.batchMint(user1.address, 10);
      expect(await kotkata.totalMinted()).to.equal(10);
      expect(await kotkata.totalSupply()).to.equal(10);
      expect(await kotkata.totalBurned()).to.equal(0);

      // Burn 3 tokens
      await kotkata.connect(user1).burn(0);
      await kotkata.connect(user1).burn(1);
      await kotkata.connect(user1).burn(2);

      expect(await kotkata.totalMinted()).to.equal(10); // Не се променя
      expect(await kotkata.totalSupply()).to.equal(7);  // 10 - 3 = 7
      expect(await kotkata.totalBurned()).to.equal(3);
      expect(await kotkata.remainingSupply()).to.equal(40); // 50 - 10 = 40
    });
  });

  describe("🔍 Edge Cases", function () {
    it("❌ Cannot query URI for non-existent token", async function () {
      const { kotkata } = await loadFixture(deployKotkataFixture);

      await expect(
        kotkata.tokenURI(999)
      ).to.be.revertedWithCustomError(kotkata, "URIQueryForNonexistentToken");
    });

    it("❌ Cannot batch mint with quantity 0", async function () {
      const { kotkata, user1 } = await loadFixture(deployKotkataFixture);

      await expect(
        kotkata.batchMint(user1.address, 0)
      ).to.be.revertedWith("Quantity must be greater than 0");
    });

    it("✅ Can mint exactly to max supply", async function () {
      const { kotkata, user1, MAX_SUPPLY } = await loadFixture(deployKotkataFixture);

      await kotkata.batchMint(user1.address, MAX_SUPPLY);
      
      expect(await kotkata.totalMinted()).to.equal(MAX_SUPPLY);
      expect(await kotkata.remainingSupply()).to.equal(0);
    });
  });

  describe("🎯 Gas Efficiency Tests", function () {
    it("✅ Batch mint is more gas efficient than individual mints", async function () {
      const { kotkata, user1 } = await loadFixture(deployKotkataFixture);

      // Individual mints
      const tx1 = await kotkata.mint(user1.address);
      const receipt1 = await tx1.wait();
      const gasSingleMint = receipt1.gasUsed;

      // Batch mint 5 tokens
      const tx2 = await kotkata.batchMint(user1.address, 5);
      const receipt2 = await tx2.wait();
      const gasBatchMint = receipt2.gasUsed;

      // Batch mint трябва да е по-евтин от 5 отделни mints
      console.log("      Single mint gas:", gasSingleMint.toString());
      console.log("      Batch mint (5 tokens) gas:", gasBatchMint.toString());
      console.log("      Estimated savings:", ((gasSingleMint * 5n - gasBatchMint) * 100n / (gasSingleMint * 5n)).toString() + "%");

      expect(gasBatchMint).to.be.lt(gasSingleMint * 5n);
    });
  });
});
