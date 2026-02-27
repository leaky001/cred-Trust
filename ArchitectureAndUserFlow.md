CredTrust Protocol — System Architecture & User Flow
Overview

CredTrust is a decentralised credit reputation and micro-lending protocol built on the Creditcoin testnet. The system enables reputation-based lending through smart contracts that manage loan creation, repayment tracking, and credit score computation.

This document defines:

system architecture

infrastructure components

smart contract design

data flow

user interaction flow

transaction lifecycle

trust boundaries

1. System Architecture
1.1 High-Level Architecture

The platform follows a layered architecture:

Client Layer → Web3 Layer → Smart Contract Layer → Blockchain Network

Architecture Diagram
+--------------------------------------------------+
|                  Client Layer                    |
|--------------------------------------------------|
| React Web App (UI)                               |
| Wallet Interface                                 |
| Dashboard & Loan Views                           |
+----------------------↓---------------------------+
|                  Web3 Layer                      |
|--------------------------------------------------|
| Wallet Provider (MetaMask / WalletConnect)       |
| Web3.js / Ethers.js                              |
| Transaction Signing                              |
+----------------------↓---------------------------+
|               Smart Contract Layer               |
|--------------------------------------------------|
| LoanFactory Contract                             |
| Loan Contract                                    |
| Credit Score Contract                            |
+----------------------↓---------------------------+
|                Creditcoin Testnet                |
|--------------------------------------------------|
| Transaction Execution                            |
| State Storage                                    |
| Consensus                                        |
+--------------------------------------------------+

1.2 Architecture Goals

trustless execution

decentralised state management

deterministic credit scoring

minimal backend reliance

transparent financial logic

secure asset handling

2. System Components
2.1 Client Layer (Frontend Application)
Responsibilities

user interface rendering

wallet connection

transaction initiation

data visualisation

state presentation

Core Modules

Authentication (wallet connect)

Loan dashboard

Credit score display

Loan creation interface

Repayment interface

Activity history

Technology

React / Next.js

TypeScript

Web3 library integration

2.2 Web3 Interaction Layer
Responsibilities

blockchain communication

transaction signing

contract interaction

event listening

Functions

connect wallet

send transactions

fetch on-chain state

monitor contract events

2.3 Smart Contract Layer

Smart contracts represent the system’s core business logic.

2.3.1 CreditScoreContract
Responsibilities

store borrower reputation

calculate credit score

track repayment history

expose score lookup

State Variables

user address

repayment record

default record

credit score

Key Functions
updateScore(address user)
getScore(address user)
recordRepayment(address user)
recordDefault(address user)

2.3.2 LoanFactoryContract
Responsibilities

create loan contracts

maintain loan registry

manage loan lifecycle

Key Functions
createLoan()
getLoan()
listLoans()

2.3.3 LoanContract
Responsibilities

manage loan agreement

handle funding

track repayment

enforce deadlines

trigger score updates

Loan Lifecycle
Requested → Funded → Active → Repaid / Defaulted

2.4 Blockchain Layer
Responsibilities

state persistence

transaction validation

execution environment

consensus mechanism

Stored Data

loan state

transaction history

credit score records

3. Data Architecture
3.1 Core Data Entities
User
address
creditScore
loanHistory
activeLoans

Loan
loanId
borrower
lender
principal
interestRate
duration
status
repaymentDeadline

Credit Record
userAddress
totalLoans
successfulRepayments
defaults
score

3.2 Data Flow
User Action → Transaction → Smart Contract → Blockchain Storage → Event → UI Update

4. Trust Boundaries
Trusted

blockchain execution environment

smart contract logic

Untrusted

client input

user wallet behaviour

network latency conditions

All inputs must be validated on-chain.

5. Security Architecture
Protections

input validation

reentrancy protection

state transition enforcement

permission control

transaction verification

Attack Surface

contract calls

loan funding process

repayment mechanism

6. User Flow Overview

The system supports two primary actors:

borrower

lender

7. Borrower User Flow
7.1 Borrower Journey
Visit App
   ↓
Connect Wallet
   ↓
View Credit Score
   ↓
Create Loan Request
   ↓
Wait for Funding
   ↓
Receive Funds
   ↓
Repay Loan
   ↓
Credit Score Updated

7.2 Borrower Flow Details
Step 1: Wallet Connection

user connects wallet

system retrieves address

credit profile loaded

Step 2: Credit Profile Check

system displays credit score

loan eligibility calculated

Step 3: Loan Creation

User submits:

amount

duration

interest

System:

deploys loan contract

records request

Step 4: Loan Activation

lender funds request

loan becomes active

Step 5: Repayment

borrower sends repayment

score updated

Step 6: Completion or Default

success → reputation increases

default → reputation decreases

8. Lender User Flow
8.1 Lender Journey
Connect Wallet
   ↓
Browse Loan Requests
   ↓
Review Borrower Credit Score
   ↓
Fund Loan
   ↓
Track Loan Status
   ↓
Receive Repayment + Interest

8.2 Lender Decision Model

Lenders evaluate:

credit score

loan terms

repayment history

9. Transaction Lifecycle
9.1 Loan Creation Transaction
User Input → Validation → Contract Deployment → Blockchain Storage → Event Emitted

9.2 Funding Transaction
Lender Approves → Funds Locked → Loan Activated → Event Emitted

9.3 Repayment Transaction
Borrower Sends Funds → Contract Validates → State Updated → Score Updated

10. State Transition Model
CREATED → FUNDED → ACTIVE → REPAID
                         ↓
                      DEFAULTED


State transitions are irreversible.

11. Event Architecture

Smart contracts emit events for UI synchronisation.

Example Events
LoanCreated
LoanFunded
LoanRepaid
LoanDefaulted
CreditScoreUpdated

12. Failure Handling
Possible Failures

insufficient funds

missed repayment deadline

invalid loan parameters

transaction rejection

Handling Strategy

revert transaction

notify UI

log failure

13. Performance Considerations

minimise gas usage

batch reads where possible

use event-driven UI updates

optimise contract storage

14. Future Architecture Extensions

decentralised identity layer

oracle integrations

cross-chain reputation

DAO governance layer

risk pricing engine

insurance pool contracts

15. Summary

The CredTrust architecture provides:

decentralised trust infrastructure

transparent lending lifecycle

deterministic reputation scoring

secure financial execution

extensible modular design

The architecture is optimised for hackathon MVP delivery while remaining scalable for production deployment.