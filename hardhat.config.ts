import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: { evmVersion: "cancun", optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    "base-sepolia": { url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org", accounts: [PRIVATE_KEY] },
    "arbitrum-sepolia": { url: process.env.ARB_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc", accounts: [PRIVATE_KEY] },
  },
  sourcify: { enabled: true },
};

export default config;
