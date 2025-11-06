const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Kotkata NFT deployment...\n");

  // Deployment parameters
  const NAME = "Kotkata";
  const SYMBOL = "KTKT";
  const BASE_URI = "ipfs://bafybeigrddomoknbxbqlfoy6wsmgdk5nlrckxwd6q7v6pzo5tfiiuycuwi/";
  const MAX_SUPPLY = 50;
  const ROYALTY_BASIS_POINTS = 500; // 5% = 500 basis points
  const ROYALTY_RECEIVER = "0x8eB8Bf106EbC9834a2586D04F73866C7436Ce298";

  console.log("📋 Deployment Configuration:");
  console.log("   Name:", NAME);
  console.log("   Symbol:", SYMBOL);
  console.log("   Base URI:", BASE_URI);
  console.log("   Max Supply:", MAX_SUPPLY);
  console.log("   Royalty:", ROYALTY_BASIS_POINTS / 100 + "%");
  console.log("   Royalty Receiver:", ROYALTY_RECEIVER);
  console.log("   Network:", hre.network.name);
  console.log("");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deploying from account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  console.log("⏳ Deploying Kotkata contract...");
  const Kotkata = await hre.ethers.getContractFactory("Kotkata");
  const kotkata = await Kotkata.deploy(
    NAME,
    SYMBOL,
    BASE_URI,
    MAX_SUPPLY,
    ROYALTY_BASIS_POINTS,
    ROYALTY_RECEIVER
  );

  await kotkata.waitForDeployment();
  const contractAddress = await kotkata.getAddress();

  console.log("✅ Kotkata deployed to:", contractAddress);
  console.log("");

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const maxSupply = await kotkata.maxSupply();
  const royaltyBPs = await kotkata.getRoyaltyBasisPoints();
  const name = await kotkata.name();
  const symbol = await kotkata.symbol();

  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Max Supply:", maxSupply.toString());
  console.log("   Royalty:", royaltyBPs.toString(), "basis points (" + Number(royaltyBPs) / 100 + "%)");
  console.log("");

  // Get transaction details
  const deployTx = kotkata.deploymentTransaction();
  const receipt = await deployTx.wait();

  // Save deployment info to JSON
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    blockNumber: receipt.blockNumber.toString(),
    transactionHash: deployTx.hash,
    gasUsed: receipt.gasUsed.toString(),
    timestamp: new Date().toISOString(),
    parameters: {
      name: NAME,
      symbol: SYMBOL,
      baseURI: BASE_URI,
      maxSupply: MAX_SUPPLY,
      royaltyBasisPoints: ROYALTY_BASIS_POINTS,
      royaltyReceiver: ROYALTY_RECEIVER,
    },
    verification: {
      verified: false,
      etherscanCommand: hre.network.name !== "hardhat" && hre.network.name !== "localhost"
        ? `npx hardhat verify --network ${hre.network.name} ${contractAddress} "${NAME}" "${SYMBOL}" "${BASE_URI}" ${MAX_SUPPLY} ${ROYALTY_BASIS_POINTS} "${ROYALTY_RECEIVER}"`
        : null
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info to file
  const filename = `${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  console.log("📝 Deployment info saved to:", filepath);
  console.log("");

  // Also save a "latest" file for easy access
  const latestFilepath = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestFilepath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📝 Latest deployment saved to:", latestFilepath);
  console.log("");

  // Display deployment summary
  console.log("📊 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Network:          ", hre.network.name);
  console.log("Contract Address: ", contractAddress);
  console.log("Deployer:         ", deployer.address);
  console.log("Block Number:     ", receipt.blockNumber);
  console.log("Gas Used:         ", receipt.gasUsed.toString());
  console.log("Transaction Hash: ", deployTx.hash);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("🔐 To verify on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${NAME}" "${SYMBOL}" "${BASE_URI}" ${MAX_SUPPLY} ${ROYALTY_BASIS_POINTS} "${ROYALTY_RECEIVER}"`);
    console.log("");
  }

  console.log("✨ Deployment completed successfully!");
  console.log("");
  console.log("🎯 Next steps:");
  console.log("   1. Verify contract on Etherscan (if mainnet/testnet)");
  console.log("   2. Set contract URI for OpenSea collection metadata");
  console.log("   3. Mint tokens using: npx hardhat run scripts/mint.js --network", hre.network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
