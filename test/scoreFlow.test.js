const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration: scoring flow", function () {
  it("creates a loan, funds it, repays it, and updates credit score", async function () {
    const [borrower, lender] = await ethers.getSigners();

    // Deploy factory as borrower
    const Factory = await ethers.getContractFactory("LoanFactory", borrower);
    const factory = await Factory.deploy();
    await factory.waitForDeployment?.();
    // For backwards compatibility, ensure deployed
    if (factory.deployTransaction) await factory.deployed();

    const creditScoreAddr = await factory.getCreditScore();
    expect(creditScoreAddr).to.properAddress;

    // Create loan: principal 1 ether, interest 5% (500 bps), duration 1 day
    const principal = ethers.parseEther("1");
    const interestBps = 500; // 5%
    const durationDays = 1;

  const tx = await factory.connect(borrower).createLoan(principal, durationDays);
  await tx.wait();

  // loanId can be retrieved from factory.loanCount() - 1
  const loanCount = await factory.loanCount();
  const loanId = Number(loanCount) - 1;
  const loanAddr = await factory.getLoan(loanId);
    expect(loanAddr).to.properAddress;

    // Lender funds the loan by sending principal
    const Loan = await ethers.getContractFactory("Loan", lender);
    const loan = Loan.attach(loanAddr).connect(lender);
    const fundTx = await loan.connect(lender).fund({ value: principal });
    await fundTx.wait();

    const loanBorrower = Loan.attach(loanAddr).connect(borrower);
    
    // Contract calculates dynamically
    const actualTotal = await loanBorrower.getTotalRepayment();
    const repayTx = await loanBorrower.repay({ value: actualTotal });
    await repayTx.wait();

    // Check credit score increased (> BASE_SCORE = 500)
    const CreditScore = await ethers.getContractFactory("CreditScore", borrower);
    const creditScore = CreditScore.attach(creditScoreAddr);
    const score = await creditScore.getScore(await borrower.getAddress());
    expect(Number(score)).to.be.greaterThan(500);
  });
});
