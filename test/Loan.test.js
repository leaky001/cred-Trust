const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredTrust", function () {
  let factory;
  let creditScoreAddress;

  before(async function () {
    const LoanFactoryContract = await ethers.getContractFactory("LoanFactory");
    factory = await LoanFactoryContract.deploy();
    await factory.waitForDeployment();
    creditScoreAddress = await factory.getCreditScore();
  });

  describe("LoanFactory", function () {
    it("should deploy CreditScore", async function () {
      expect(creditScoreAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should create a loan", async function () {
      const [borrower] = await ethers.getSigners();
      await factory.connect(borrower).createLoan(
        ethers.parseEther("100"),
        500, // 5%
        30
      );
      const loanAddr = await factory.getLoan(0);
      expect(loanAddr).to.not.equal(ethers.ZeroAddress);
      expect(await factory.loanCount()).to.equal(1);
    });
  });

  describe("Loan lifecycle", function () {
    it("should fund and repay", async function () {
      const [borrower, lender] = await ethers.getSigners();
      await factory.connect(borrower).createLoan(
        ethers.parseEther("10"),
        500, // 5%
        7
      );
      const loanAddr = await factory.getLoan(1);
      const loan = await ethers.getContractAt("Loan", loanAddr);

      await loan.connect(lender).fund({ value: ethers.parseEther("10") });
      expect(await loan.status()).to.equal(2); // Active

      const total = await loan.getTotalRepayment();
      await loan.connect(borrower).repay({ value: total });
      expect(await loan.status()).to.equal(3); // Repaid
    });
  });
});
