require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // --- SOLIDITY CONFIG ---
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  // --- NETWORKS CONFIG ---
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },
  },

  // --- ETHERSCAN CONFIG (КОРЕКЦИЯТА Е ТУК!) ---
  etherscan: {
    // ВМЕСТО ОБЕКТ (V1), СЕГА ИЗПОЛЗВАМЕ НИЗ (V2)
    apiKey: process.env.ETHERSCAN_API_KEY || "", 
    // Хардхат автоматично ще знае кой Explorer да използва въз основа на Network ID (chainId)
  },

  // --- SOURCIFY CONFIG ---
  sourcify: {
    enabled: false
  }
};
