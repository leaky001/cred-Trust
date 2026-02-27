#!/usr/bin/env node
const http = require('http');
const https = require('https');

function fetchRpc(rpcUrl) {
  return new Promise((resolve, reject) => {
    const lib = rpcUrl.startsWith('https') ? https : http;
    const body = JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 });
    const u = new URL(rpcUrl);
    const opts = {
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + (u.search || ''),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = lib.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.result);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const rpc = process.argv[2] || process.env.CREDITCOIN_TESTNET_RPC || 'https://rpc.cc3-testnet.creditcoin.network';
  try {
    const hex = await fetchRpc(rpc);
    const dec = parseInt(hex, 16);
    console.log(`RPC: ${rpc}`);
    console.log(`eth_chainId: ${hex} (decimal ${dec})`);
  } catch (err) {
    console.error('Failed to query RPC:', err.message || err);
    process.exitCode = 1;
  }
}

main();
