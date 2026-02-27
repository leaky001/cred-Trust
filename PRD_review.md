# PRD Review & Action Items — CredTrust

This document converts the high-level `ProjectPRD.md` into concrete acceptance criteria (AC), maps features to repository files, and lists prioritized implementation tasks.

Summary
- Repo already implements core smart contracts: `CreditScore`, `Loan`, `LoanFactory` (see `contracts/`).
- Frontend wiring expects `NEXT_PUBLIC_LOAN_FACTORY_ADDRESS`, `NEXT_PUBLIC_CREDIT_SCORE_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID` (see `src/lib/contracts/config.ts`).
- Deploy scripts exist (`scripts/deploy.js`, `blockchain/scripts/deploy.ts`) and print NEXT_PUBLIC_* lines for easy copy/paste.

Priority acceptance criteria (copy into PRD)

Wallet & Identity
- AC-1: Users can connect MetaMask or WalletConnect and the UI shows the connected address and network within 30s.
- AC-2: If connected to a wrong chain, UI displays an explicit error and shows the expected chain ID and RPC.

Credit Reputation Engine
- AC-3: After a successful on-chain repayment, `CreditScore.recordRepayment()` must have been called. `getScore(address)` must return > BASE_SCORE (500) for the repayer if principal > 0.
- AC-4: Defaults properly call `recordDefault()` and reduce the score by at least `DEFAULT_PENALTY` per default.

Loan Request & Funding
- AC-5: `LoanFactory.createLoan()` emits `LoanCreated` and `LoanFactory.listLoans()` returns the created loan address.
- AC-6: Funding a loan requires `msg.value >= principal` and sets loan `status` to `Active`.

Repayment & Default Handling
- AC-7: `Loan.repay()` transfers principal+interest to lender and calls `creditScore.recordRepayment()`; the borrower's score updates accordingly.
- AC-8: `Loan.markDefaulted()` callable only after overdue and calls `creditScore.recordDefault()`.

Mapping of PRD features to repository files
- On-chain scoring: `contracts/CreditScore.sol`, artifacts in `artifacts/` and `blockchain/artifacts/`.
- Loan lifecycle: `contracts/Loan.sol` implements funding/repay/default logic.
- Factory & deployment: `contracts/LoanFactory.sol`, `scripts/deploy.js`, `blockchain/scripts/deploy.ts`.
- Frontend integration: `src/hooks/useLoans.ts`, `src/lib/contracts/config.ts`, `src/app/*` pages & components.

Test coverage recommendations (minimal set)
- Unit tests for `Loan.repay()` happy path + early repayment edge case.
- Integration test: deploy `LoanFactory`, `createLoan`, fund from lender, repay from borrower, assert `CreditScore.getScore(borrower) > BASE_SCORE`.

Operational / onboarding tasks
- Add `.env.example` guidance and ensure `.env.local` is in `.gitignore` (done).
- Provide `scripts/checkBalance.js` to verify balances.
- Document how to obtain testnet CC or fallback to Hardhat local accounts.

Next steps (recommended)
1. Add the integration test listed above and run it locally (I added `test/scoreFlow.test.js`).
2. Expand PRD acceptance criteria for each section (I can author this further if you want a fully rewritten PRD).
3. Add CI to run contract tests on PRs.

If you want, I will convert every PRD section into 2–4 ACs and produce a tracked `PRD_review.md` with owners and estimates. Reply with “Please expand PRD” to continue.
