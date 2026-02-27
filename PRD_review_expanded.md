# PRD — Expanded Acceptance Criteria, Metrics, Owners & Implementation Backlog

This document expands `ProjectPRD.md` into concrete acceptance criteria (AC), measurable success metrics, suggested owners, rough estimates, test cases, and a prioritized implementation backlog mapped to repository files. Use this as the working checklist to finish the MVP.

Date: 2026-02-25

---

## 1. Summary

Goal: Deliver a Hackathon MVP that demonstrates reputation-based, undercollateralised lending on Creditcoin with on-chain scoring, loan creation, funding, repayment, and a dashboard that shows credit scores and loan state.

Scope (MVP): wallet integration, loan request creation, loan funding (full funding), repayment, on-chain credit scoring, basic dashboard UI, testnet deploy or local demo.

Out of scope for MVP: identity/KYC, governance, insurance pools, cross-chain, fiat rails.

---

## 2. Acceptance Criteria (detailed)

Note: ACs are written to be testable and include pass/fail criteria.

2.1 Wallet & Identity
- AC-W1: A user can connect a web3 wallet (MetaMask) from the landing page. After connecting, their address appears in the header within 10s. (Test: connect with MetaMask; header shows address.)
- AC-W2: If the user is on the wrong chain, the app clearly shows the expected chain ID and an explanatory message; an action to copy the RPC is provided. (Test: switch MetaMask to another chain; error appears.)

2.2 Credit Reputation Engine
- AC-C1: When a loan contract executes `repay()` successfully, `CreditScore.recordRepayment()` is called and the user's `getScore(address)` increases by at least 1 point above BASE_SCORE if it was base before (expected > 500). (Test: deploy locally, execute repay flow, call getScore.)
- AC-C2: When a loan is defaulted via `markDefaulted()`, `CreditScore.recordDefault()` is called and `getScore(address)` decreases by DEFAULT_PENALTY per default. (Test: simulate overdue, call markDefaulted, check score.)

2.3 Loan Request System
- AC-LR1: `createLoan()` emits `LoanCreated` with correct borrower, principal, interestRateBps, durationDays and the loan becomes discoverable by `LoanFactory.listLoans()` and `loanCount()`. (Test: create loan and assert factory list includes new address.)
- AC-LR2: Borrower eligibility checks: reject zero-principal and invalid interest/duration values. (Test: attempt createLoan with zero/invalid values; it must revert with proper message.)

2.4 Loan Funding Module
- AC-LF1: Funding requires `msg.value >= principal` and lender != borrower. When funded, loan `status` transitions to `Active` and `LoanFunded` emitted. (Test: fund loan; check status and event.)

2.5 Repayment System
- AC-R1: Repayment requires `msg.value >= principal + interest` and transfers funds to lender; borrower receives any excess as refund; `LoanRepaid` event emitted and score recorded. (Test: repay with exact & with excess; lender balance increases appropriately.)

2.6 Default Handling
- AC-D1: `markDefaulted()` callable only by the `LoanFactory` and only after `repaymentDeadline`. On call, loan status becomes `Defaulted`, `recordDefault()` called, and remaining balance is transferred to lender. (Test: attempt before deadline — revert; after deadline — succeed.)

2.7 Dashboard & UI
- AC-UI1: Dashboard shows credit score, active loans, and loan history for connected wallet. Data must reflect on-chain state within 30s of the event. (Test: run loan flows and confirm dashboard shows updates.)

---

## 3. Success Metrics (MVP)
- Loan creation count (goal: 100 test loans for demo). 
- Repayment rate (demo target: >= 80%).
- UI connectivity success: >= 90% of users can connect wallet in first attempt.
- Score update latency: < 60s from on-chain event to UI reflection (for demo environment/indexer absent).

---

## 4. Owners & Rough Estimates (MVP tasks)
- Frontend (Wallet & Dashboard): 1 dev — 1.5 days
- Smart contracts & tests: 1 dev — 2 days
- DevOps / Onboarding (env + docs): 1 dev — 0.5 day
- Integration tests & CI: 1 dev — 1 day

---

## 5. Test Plan (minimal)

Unit tests (per contract)
- CreditScore: test recordRepayment/onTime behavior, recordDefault, getScore baseline.
- Loan: fund(), repay() with exact and excess, markDefaulted(), getTotalRepayment.
- LoanFactory: createLoan(), listLoans(), getLoan(), getCreditScore()

Integration tests
- Score flow (already added): factory -> createLoan -> fund -> repay -> assert score > BASE.

End-to-end demo
- Deploy locally -> create loan via UI -> fund via another account -> repay -> observe dashboard update.

---

## 6. Implementation Backlog (prioritized, mapped to files)

High priority (developer onboarding & correctness)
1) Populate runtime env & onboarding docs (done) — Files: `.env.example` (root), `blockchain/.env.example`, `README.md` (added Developer Onboarding). (Status: done)
2) Ensure `NEXT_PUBLIC_*` addresses are set for local dev and testnet deployment process — Files: `scripts/deploy.js`, `blockchain/scripts/deploy.ts`. Add optional flag to write `.env.local`. (Status: TODO)
3) Add integration test for scoring flow — Files: `test/scoreFlow.test.js` (done)

Medium priority (UX & functionality)
4) Implement loan funding UI (if missing) — Files: `src/app/loans/*` and `src/components/*` (LoansList shows Fund Loan button but handler is not wired). Task: add fund handler that calls Loan.fund() and updates UI. (Status: TODO)
   - Subtasks: add contract call to fund, wire confirmation, update fetchLoans after fund.
5) Implement repayment UI — Files: `src/app/loans/*` or loan detail page. (Status: TODO)
6) Dashboard wiring: include `LoansList` or fetch loans for connected wallet and show personalized view — Files: `src/app/dashboard/page.tsx`. (Status: TODO)

Low priority (ops & polish)
7) Add CI that runs `pnpm run test:contracts` on PRs — Files: `.github/workflows/ci.yml` (Status: TODO)
8) Verify Creditcoin testnet chain ID and update hardhat config `blockchain/hardhat.config.ts` and top-level `hardhat.config.js` if necessary. (Status: TODO)
9) Document testnet faucet or guidance to obtain CC — README.md (Status: TODO)

---

## 7. Concrete Developer Tasks (step-by-step)

Task A — Wire Fund action in LoansList
1. Add a `fundLoan` method in `src/hooks/useLoans.ts` that takes a loan address and calls `loanContract.fund({ value: principal })` using signer. Return tx and await.
2. Expose the function from `useLoans` and call it from `LoansList` when the Fund Loan button is clicked. Refresh loans after success.
3. Test by creating a loan with one account and funding via another account in the UI.

Files touched: `src/hooks/useLoans.ts`, `src/app/loans/LoansList.tsx`

Task B — Wire Repay action (simple flow)
1. Add `repayLoan` in `useLoans.ts` that calls `loanContract.repay({ value: total })`.
2. Add a Loan detail or inline repay button to trigger repay (for borrower) and show confirmations.

Files touched: `src/hooks/useLoans.ts`, `src/app/loans/[loanId].tsx` (create if missing)

Task C — Dashboard: show user loans
1. Update `src/app/dashboard/page.tsx` to call `fetchLoans()` and filter loans where borrower === connected address or lender === connected address.
2. Display an actionable list (reuse `LoansList` components or create a compact list for dashboard).

Files touched: `src/app/dashboard/page.tsx`, `src/app/loans/LoansList.tsx`

Task D — Add CI
1. Add `.github/workflows/ci.yml` to run `pnpm install` and `pnpm run test:contracts` using Node 18+ and install Hardhat dependencies.

---

## 8. Acceptance Test Cases (copy/paste friendly)

Test Case 1 — Loan create & list
1. Preconditions: local hardhat node or test environment with contracts deployed and addresses set in `.env.local`.
2. Steps: Connect wallet, submit loan request via UI with principal 1 CTC, interest 5, duration 1 day.
3. Expected: `LoanFactory.listLoans()` includes the new loan address; UI lists loan as Requested.

Test Case 2 — Fund & Repay (end-to-end)
1. Preconditions: two wallet accounts available in MetaMask or separate browser sessions.
2. Steps: Borrower creates loan; Lender funds loan; Borrower repays (principal+interest); wait for confirmation.
3. Expected: Loan transitions Requested->Active->Repaid and `CreditScore.getScore(borrower)` > BASE_SCORE.

Test Case 3 — Default
1. Steps: Create loan with very short duration (1 day), fund, simulate passage of time (local Hardhat increaseTime) beyond deadline, call `markDefaulted()` from factory.
2. Expected: Loan status Defaulted, score decreased by DEFAULT_PENALTY.

---

## 9. Risks & Mitigations
- Risk: Committed secrets — Mitigation: `.env.example` only, `.env.local` in `.gitignore` (done), rotate keys if leaked (script added).
- Risk: Partial funding ambiguity — Mitigation: For MVP, require full funding and document behavior; later add partial-funding accounting.
- Risk: UI not in sync with on-chain events — Mitigation: Polling/subscribe to events or use an indexer for production; for demo, polling 15–30s is acceptable.

---

## 10. Next actions I can take (pick any)
1. Implement Tasks A and B (fund & repay handlers) and run local smoke tests. (Est: 2–4 hours)
2. Wire Dashboard to show live loans for connected user (Est: 1–2 hours).
3. Add CI workflow for contract tests (Est: 1 hour).
4. Expand PRD into per-section ACs with full owners and timelines (I can add JIRA-style tickets). (Est: 2–3 hours)

Tell me which of the next actions you want me to execute and I will proceed. If you want me to continue implementing the highest-impact item, I will wire the Fund + Repay handlers and update the Dashboard to surface active loans for connected users.
