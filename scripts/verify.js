const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xDC4cB826F763701DCBE002968A3258578dc66bec";
  
  const NAME = "Kotkata";
  const SYMBOL = "KTKT";
  const BASE_URI = "ipfs://bafybeigrddomoknbxbqlfoy6wsmgdk5nlrckxwd6q7v6pzo5tfiiuycuwi/";
  const MAX_SUPPLY = 50;
  const ROYALTY_BASIS_POINTS = 500;
  const ROYALTY_RECEIVER = "0x8eB8Bf106EbC9834a2586D04F73866C7436Ce298";

  console.log("🔍 Verifying contract on Etherscan...");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  console.log("");

  try {
    await hre.run("verify:verify", {
      address: CONTRACT_ADDRESS,
      constructorArguments: [
        NAME,
        SYMBOL,
        BASE_URI,
        MAX_SUPPLY,
        ROYALTY_BASIS_POINTS,
        ROYALTY_RECEIVER,
      ],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:");
      console.error(error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
