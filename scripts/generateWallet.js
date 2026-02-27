#!/usr/bin/env node
// Generate a new random wallet (local only). Prints address and private key.
// WARNING: Do this locally. Do NOT paste the private key in public chat.

const { ethers } = require('ethers');

function main(){
  const wallet = ethers.Wallet.createRandom();
  console.log('NEW_ADDRESS=' + wallet.address);
  console.log('NEW_PRIVATE_KEY=' + wallet.privateKey);
  console.log('\nStore the private key securely (password manager or OS keychain).');
}

main();
