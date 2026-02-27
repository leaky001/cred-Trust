PRODUCT REQUIREMENTS DOCUMENT (PRD)
CredTrust Protocol
projectPRD.md 

Decentralised Credit Reputation and Micro-Lending Platform on Creditcoin

Version: 1.0
Document Owner: Product Lead
Product Type: DeFi Infrastructure / Credit Protocol
Target Release: Hackathon MVP → Production Evolution

1. Executive Summary
1.1 Product Vision

CredTrust is a decentralised credit infrastructure that enables reputation-based lending without traditional collateral. The platform establishes a portable on-chain credit profile and facilitates peer-to-peer micro-lending with transparent risk evaluation.

The product demonstrates how blockchain can enable inclusive financial systems where trust is verifiable, programmable, and decentralised.

1.2 Strategic Objectives

Enable undercollateralised lending using reputation.

Provide transparent credit scoring infrastructure.

Demonstrate real-world financial use cases.

Showcase Creditcoin capabilities for trust-based finance.

Create reusable credit primitives for Web3.

1.3 Value Proposition
For Borrowers

Access to capital without heavy collateral

Portable financial reputation

Transparent loan history

For Lenders

Risk visibility

Automated interest returns

Transparent borrower history

For Ecosystem

Trust layer for decentralised finance

Real-world financial infrastructure

2. Problem Definition
2.1 Traditional Credit Problems

Centralised decision-making

Exclusion of underbanked users

Opaque credit scoring models

Limited global portability of reputation

2.2 DeFi Limitations

Over-collateralisation (150%+)

No reputation-based lending

Limited real-world usability

3. Product Scope
3.1 MVP Scope (Hackathon Build)
Included

Wallet connection

Loan request system

Loan funding system

Repayment tracking

On-chain credit scoring

Borrower reputation

Basic dashboard UI

Smart contract deployment on testnet

Excluded (Future)

Identity verification

DAO governance

Risk markets

Insurance pools

Cross-chain support

4. Target Users
4.1 Primary

DeFi users

Crypto lenders

Web3 developers

Microfinance innovators

4.2 Secondary

Emerging market users

Fintech researchers

Credit infrastructure builders

5. Functional Requirements
5.1 Wallet & Identity Layer
Requirements

Web3 wallet connection

Address-based identity

Session persistence

Transaction signing

Acceptance Criteria

User connects wallet successfully

System retrieves address

Transactions sign and execute

5.2 Credit Reputation Engine
Description

A deterministic scoring model based on repayment behaviour.

Data Stored

loans taken

loans repaid

repayment timeliness

default count

total borrowed value

Score Calculation Model (Example)
Credit Score = Base Score
+ (Completed Loans × Weight)
+ (On-time Repayment Rate × Multiplier)
− (Defaults × Penalty)

Requirements

Score updates automatically

Score stored on-chain

Score queryable by lenders

5.3 Loan Request System
Inputs

requested amount

interest rate

duration

repayment schedule

System Behaviour

creates loan contract

records borrower details

exposes loan listing

Validation

borrower eligibility check

active loan limit enforcement

5.4 Loan Funding Module
Behaviour

lender selects loan request

funds locked in contract

loan activated

Requirements

partial or full funding (optional MVP decision)

funding event recorded

5.5 Repayment System
Behaviour

borrower submits repayment

interest calculated

credit score updated

Conditions

early repayment supported

overdue tracking

5.6 Default Handling
Rules

loan marked defaulted after deadline

credit score reduced

loan history preserved

5.7 Dashboard Interface
Displays

credit score

active loans

loan history

lending activity

system status

6. System Architecture
6.1 High-Level Architecture
User Interface (Web App)
       ↓
Web3 Provider / Wallet Layer
       ↓
Smart Contract Layer
       ↓
Creditcoin Testnet


Optional:

Indexer / Backend API → Analytics

6.2 Smart Contract Architecture
Contracts
1. CreditScoreContract

stores reputation data

updates scores

exposes score API

2. LoanFactoryContract

creates loan instances

manages listings

3. LoanContract

funding logic

repayment logic

default handling

6.3 Data Model
User

address

credit score

loan history

Loan

borrower

lender

principal

interest

duration

status

7. Technology Stack
Blockchain

Creditcoin testnet

Smart Contracts

Solidity (or compatible)

Frontend

React / Next.js

Web3.js / Ethers.js

Storage

On-chain storage

Optional IPFS metadata

Development Tools

Hardhat or Foundry

GitHub

CI pipeline

8. Security Requirements
Mandatory Protections

reentrancy protection

overflow prevention

access control

input validation

loan duplication prevention

Testing Requirements

unit tests

integration tests

contract simulation

9. Performance Requirements

Transaction confirmation < network latency threshold

Gas-optimised contract operations

UI response time < 2 seconds

10. User Experience Requirements

minimal onboarding

clear loan workflow

readable credit score

transaction transparency

responsive UI

11. Compliance & Legal Considerations

For MVP:

no KYC required

no custody of fiat

testnet only

Future:

jurisdictional compliance

consumer lending laws

12. Success Metrics

loan creation count

repayment rate

system uptime

credit score updates

user activity

demo success

13. Development Roadmap
Phase 1: Foundation

wallet integration

basic UI

contract setup

Phase 2: Core Lending

loan creation

funding logic

repayment logic

Phase 3: Reputation Engine

scoring algorithm

score updates

Phase 4: Integration

UI integration

testnet deployment

Phase 5: Demo Preparation

documentation

video demo

testing

14. Risk Analysis
Risk	Impact	Mitigation
smart contract bugs	high	extensive testing
loan abuse	medium	score penalties
time constraints	high	MVP scope control
15. Future Expansion

decentralised identity integration

DAO lenders

insurance pools

AI credit risk models

cross-chain reputation

RWA collateral

mobile app
```
16. Implementation Status & Next Steps

This section maps the PRD's functional requirements to the current repository implementation, highlights gaps, and provides a prioritized set of next actions to complete the MVP and prepare for a demo deployment.

16.1 Mapping: what's implemented (high-level)

- Wallet & Identity Layer: Wallet connection and transaction signing implemented in the frontend (`src/contexts/WalletContext.tsx`). Status: Done (basic).
- Credit Reputation Engine: `CreditScore.sol` contract implemented and wired to front-end via `src/lib/contracts/` and `src/hooks/useLoans.ts`. Status: Done (on-chain scoring, read/write).
- Loan Request System: Loan creation via `LoanFactory` and `Loan` contracts exists; frontend loan request UI scaffold present in `src/app/loans`. Status: Partially done (backend + create flow implemented).
- Loan Funding Module: Contract-level funding exists (`Loan.fund()`); frontend handlers for fund/repay added in `src/hooks/useLoans.ts` and wired to `LoansList.tsx`. Status: Partially done (contract OK; UI flow needs polish and confirmation UX).
- Repayment System: `Loan.repay()` and scoring updates are implemented and covered by integration tests (`test/scoreFlow.test.js`). Status: Done (contract + test coverage); UI needs friendly flow.
- Default Handling: Contracts include default marking; however, integration and scheduled/default detection tools are not implemented in the frontend/backend. Status: Backend indexer / cron task required.
- Dashboard Interface: Basic dashboard and loans list present (`src/app/dashboard/page.tsx`, `LoansList.tsx`). Status: Partially done (layout present; detailed loan pages, UX and filters needed).

16.2 Gaps / remaining MVP tasks (prioritised)

1) UX polish for funding & repayment (high impact, low risk)
       - Add confirm modals, clear success/error toasts, and loading states for fund/repay actions.
       - Refresh loan list after actions and surface transaction hashes.

2) Loan detail page (medium)
       - Implement a per-loan page showing repayment schedule, history, and borrower score.

3) Partial funding support & optimistic UI (medium)
       - If partial funding is allowed, reflect remaining amount and track multiple lenders.

4) Default detection & notifications (medium-high)
       - Add a small backend/indexer (optional serverless function) that watches loan deadlines and marks defaults by calling `markDefaulted()` where appropriate; or provide a manual admin action in UI.

5) End-to-end demo script & docs (high priority for demo)
       - Create a reproducible demo script (already have `scripts/autoFlow.js`) and update README with step-by-step demo notes and expected outputs.

6) CI / Test expansion (low risk)
       - Extend the existing contract CI to run additional lint/tests and optionally spin up a local testnet for integration tests.

7) Security & Governance (later)
       - Threat modelling, KYC/Compliance notes for production, and design for governance (DAO) if moving beyond MVP.

16.3 Short plan of concrete changes I can make now (pick one or I'll start sequence)

- A: Implement UX polish for fund/repay — small React changes: add modal, loading states, toast on success/failure, and auto-refresh loans list. Low-risk and demonstrable.
- B: Add a Loan detail page + route and wire data fetch — medium work but improves demo visuals.
- C: Implement backend default-watcher skeleton (a serverless script that can be run manually) and document how to run it for demos.
- D: Produce demo-run checklist and finalize README with exact commands and expected outputs (quick, docs-only).

16.4 Acceptance criteria for completion

- Fund/Repay UX: Users can fund and repay a loan from the UI, see a confirmation modal, see the tx hash, and the loan list updates within 10s.
- Loan Detail: Visiting a loan address route shows loan metadata, repayment schedule, lender list, and borrower score.
- Default Watcher: Running the watcher marks loans as defaulted when past deadline and records score changes on-chain; documented run steps exist.

16.5 Ownership and rough ETA (for MVP polish)

- UX polish (A) — Owner: frontend developer — ETA: 1-2 days
- Loan detail page (B) — Owner: frontend developer — ETA: 1-2 days
- Default watcher (C) — Owner: backend/devops — ETA: 1-2 days (skeleton), 3-5 days for production-ready
- Demo docs (D) — Owner: product/engineering — ETA: a few hours

16.6 Next immediate action (I'll perform unless you choose otherwise)

I will implement A (UX polish) now: add a confirm modal for fund/repay in `src/components/ui/`, wire it into `src/app/loans/LoansList.tsx`, and ensure the loans list refreshes after transactions. This is low-risk and makes the app demo-ready quickly. If you'd prefer B, C, or D instead, tell me which.

```