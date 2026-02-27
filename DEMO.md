# Demo runbook

This document describes a quick reproducible demo flow you can run locally to showcase CredTrust features (deploy contracts, run frontend, and exercise fund→repay flow).

Prerequisites
- Node.js 20+ and pnpm (or npm)
- git clone of this repository
- No secrets committed (use env vars for keys)

1) Install dependencies

```powershell
pnpm install
```

2) Deploy to local Hardhat (in-process)

Open a PowerShell shell in the repo root and run:

```powershell
# Deploy contracts to the local Hardhat network (in-process)
pnpm run deploy:local
```

The deploy script prints suggested env lines like:

```
NEXT_PUBLIC_LOAN_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_CREDIT_SCORE_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=31337
```

Copy those into a local `.env.local` file in the repo root (do NOT commit this file).

3) Start the frontend

```powershell
pnpm dev
```

Open the URL printed by Next (e.g., http://localhost:3000).

4) Exercise flows

- Create a loan request from the UI (Borrower flow)
- Click "Fund Loan" on a Requested loan and confirm; use the input to try partial funding values.
- If you funded and the borrower is your account, try "Repay" on the loan detail page.

5) Automated smoke flow (optional)

This repo includes `scripts/autoFlow.js` which programmatically creates → funds → repays a loan using local accounts and prints the final credit score. Run it against a local Hardhat node with logging enabled.

6) Quick page check

We include a tiny smoke script that verifies the `/loans` page returns HTTP 200 and contains the expected content. Start the dev server, then in a separate shell run:

```powershell
node ./scripts/smokeTest.js http://localhost:3000/loans
```

Notes
- Partial funding UI allows entering an arbitrary amount, but the on-chain behavior depends on the Loan variant deployed. If the deployed loan contract requires exact equality to principal (msg.value == principal), partial amounts will revert. For true multi-lender partial funding, the contract must be updated to track per-lender contributions (this demo shows UI behavior only).
- For testnet deployments, use ephemeral environment variables and do NOT commit private keys. Use `scripts/transferFunds.js` to rotate compromised keys (run only locally with env vars set).