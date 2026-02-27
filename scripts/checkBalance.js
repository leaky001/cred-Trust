#!/usr/bin/env node
// Simple balance checker for onboarding
// Usage (PowerShell):
// $env:CREDITCOIN_TESTNET_RPC = "https://rpc.cc3-testnet.creditcoin.network"; node .\scripts\checkBalance.js 0xYourAddress

const { ethers } = require('ethers');

async function main() {
  const rpc = process.env.CREDITCOIN_TESTNET_RPC || process.env.RPC || 'https://rpc.cc3-testnet.creditcoin.network';
  const provider = new ethers.JsonRpcProvider(rpc);
  const addr = process.argv[2] || process.env.ADDRESS;
  if (!addr) {
    console.error('Usage: node scripts/checkBalance.js <address>\nOr set ADDRESS env var.');
    process.exit(1);
  }

  try {
    const balance = await provider.getBalance(addr);
    const ether = Number(balance) / 1e18;
    console.log('Address:', addr);
    console.log('Balance (wei):', balance.toString());
    console.log('Balance (CC approx):', ether);
  } catch (err) {
    console.error('Error fetching balance:', err.message || err);
    process.exit(1);
  }
}

main();
