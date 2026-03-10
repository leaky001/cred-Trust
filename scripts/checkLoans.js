#!/usr/bin/env node
// Check the LoanFactory for existing loans using a JSON-RPC provider.
// This script now retries the RPC connection a few times and prints clearer
// diagnostics when the JSON-RPC is unreachable.
// Usage: node scripts/checkLoans.js [rpcUrl]

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

function readEnvLocal() {
  const p = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(p)) return {};
  const raw = fs.readFileSync(p, 'utf8');
  const out = {};
  raw.split(/\r?\n/).forEach(line => {
    const m = line.match(/^([^=]+)=([\s\S]*)$/);
    if (m) out[m[1]] = m[2];
  });
  return out;
}

async function waitForRpc(rpc, attempts = 5, delayMs = 1000) {
  const provider = new ethers.JsonRpcProvider(rpc);
  for (let i = 1; i <= attempts; i++) {
    try {
      // A lightweight call to verify the provider is up
      await provider.getBlockNumber();
      return provider;
    } catch (err) {
      if (i === attempts) throw err;
      process.stdout.write(`RPC not ready (attempt ${i}/${attempts}), retrying in ${delayMs}ms... `);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

(async () => {
  try {
    const env = readEnvLocal();
    const factoryAddr = env.NEXT_PUBLIC_LOAN_FACTORY_ADDRESS || process.env.NEXT_PUBLIC_LOAN_FACTORY_ADDRESS;
    if (!factoryAddr) {
      console.error('No NEXT_PUBLIC_LOAN_FACTORY_ADDRESS found in .env.local or env');
      process.exit(2);
    }
    const rpc = process.argv[2] || process.env.RPC || 'http://127.0.0.1:8545';
    console.log('Using RPC:', rpc);

    let provider;
    try {
      provider = await waitForRpc(rpc, 6, 1000);
    } catch (err) {
      console.error('\nFailed to connect to JSON-RPC at', rpc);
      console.error('Hint: Make sure `npx hardhat node` is running and listening on that address.');
      console.error('Detailed error:', err.message || err);
      process.exit(1);
    }

    const abiPath = path.resolve(__dirname, '..', 'src', 'lib', 'contracts', 'LoanFactory.json');
    if (!fs.existsSync(abiPath)) {
      console.error('Could not find LoanFactory ABI at', abiPath);
      process.exit(2);
    }
    const abi = require(abiPath).abi;
    const factory = new ethers.Contract(factoryAddr, abi, provider);
    console.log('Querying factory at', factoryAddr);
    const list = await factory.listLoans();
    console.log('Loan addresses:', list);
    if (!list || list.length === 0) {
      console.log('No loans found in factory. Either the create tx failed, or you are pointing to the wrong RPC/network.');
    } else {
      for (let i = 0; i < list.length; i++) {
        console.log(i, list[i]);
      }
    }
  } catch (err) {
    console.error('Error querying factory:');
    console.error(err && err.stack ? err.stack : (err.message || err));
    process.exit(1);
  }
})();
