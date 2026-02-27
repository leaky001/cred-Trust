require("ts-node/register");
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: "0.8.24",
    networks: {
        // Creditcoin Testnet Configuration (used for deploying to the Creditcoin testnet)
        // NOTE: This network config is for the external Creditcoin testnet and intentionally
        // uses the testnet's chain id. For local development with Hardhat, use the top-level
        // `hardhat.config.js` network which uses the local chainId 31337.
        creditcoin: {
            url: process.env.CREDITCOIN_TESTNET_RPC || "https://rpc.cc3-testnet.creditcoin.network",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 102031, // Verified Creditcoin testnet chain id (confirmed via RPC)
        },
    },
};

export default config;
