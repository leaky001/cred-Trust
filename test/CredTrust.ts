import { expect } from "chai";
import hre from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CredTrust Protocol", function () {
    let creditScore: any;
    let loanFactory: any;
    let loan: any;
    let admin: SignerWithAddress;
    let borrower: SignerWithAddress;
    let lender: SignerWithAddress;

    beforeEach(async function () {
        [admin, borrower, lender] = await hre.ethers.getSigners();

        // Deploy CreditScoreContract
        const CreditScoreContract = await hre.ethers.getContractFactory("CreditScoreContract");
        creditScore = await CreditScoreContract.deploy();

        // Deploy LoanFactoryContract
        const LoanFactoryContract = await hre.ethers.getContractFactory("LoanFactoryContract");
        loanFactory = await LoanFactoryContract.deploy(await creditScore.getAddress());

        // Authorize Factory (in a real scenario, Factory might not need auth, but Loan contracts do)
        await creditScore.authorizeContract(await loanFactory.getAddress(), true);
    });

    describe("CreditScoreContract", function () {
        it("Should initialize a new user with base score of 500", async function () {
            const score = await creditScore.getScore(borrower.address);
            expect(score).to.equal(500n);
        });

        it("Should allow admin to authorize contracts", async function () {
            await creditScore.authorizeContract(lender.address, true);
            const isAuth = await creditScore.authorizedContracts(lender.address);
            expect(isAuth).to.be.true;
        });
    });

    describe("LoanFactory & Loan Lifecycle", function () {
        const principal = hre.ethers.parseEther("1.0");
        const interestRate = 5n; // 5%
        const duration = 86400n; // 1 day in seconds

        beforeEach(async function () {
            // Borrower creates a loan request
            await loanFactory.connect(borrower).createLoanRequest(principal, interestRate, duration);

            const allLoans = await loanFactory.getAllLoans();
            const loanAddress = allLoans[0];

            // Get the deployed LoanContract instance
            const LoanContract = await hre.ethers.getContractFactory("LoanContract");
            loan = LoanContract.attach(loanAddress);

            // Authorize the specific Loan contract to update credit scores
            await creditScore.authorizeContract(loanAddress, true);
        });

        it("Should create a loan with correct parameters", async function () {
            expect(await loan.borrower()).to.equal(borrower.address);
            expect(await loan.principal()).to.equal(principal);
            expect(await loan.interestRate()).to.equal(interestRate);
            expect(await loan.status()).to.equal(0n); // 0 = REQUESTED
        });

        it("Should allow lender to fund loan and transfer funds to borrower", async function () {
            const initialBorrowerBal = await hre.ethers.provider.getBalance(borrower.address);

            await expect(loan.connect(lender).fundLoan({ value: principal }))
                .to.emit(loan, "LoanFunded")
                .withArgs(lender.address, principal);

            const finalBorrowerBal = await hre.ethers.provider.getBalance(borrower.address);

            expect(await loan.status()).to.equal(1n); // 1 = FUNDED
            expect(await loan.lender()).to.equal(lender.address);
            expect(finalBorrowerBal - initialBorrowerBal).to.equal(principal);
        });

        it("Should process repayment and increase credit score", async function () {
            // 1. Fund
            await loan.connect(lender).fundLoan({ value: principal });

            // 2. Calculate Repayment (1.0 + 5% = 1.05 ETH)
            const repaymentAmount = await loan.calculateTotalRepayment();
            expect(repaymentAmount).to.equal(hre.ethers.parseEther("1.05"));

            // 3. Repay
            const initialLenderBal = await hre.ethers.provider.getBalance(lender.address);

            const tx = await loan.connect(borrower).repayLoan({ value: repaymentAmount });
            const receipt = await tx.wait();
            // Calculate real balance change accounting for gas

            const finalLenderBal = await hre.ethers.provider.getBalance(lender.address);

            expect(await loan.status()).to.equal(2n); // 2 = REPAID
            expect(finalLenderBal - initialLenderBal).to.equal(repaymentAmount);

            // 4. Check Credit Score (Base 500 + 10 = 510)
            const newScore = await creditScore.getScore(borrower.address);
            expect(newScore).to.equal(510n);
        });

        it("Should process default and decrease credit score", async function () {
            // 1. Fund
            await loan.connect(lender).fundLoan({ value: principal });

            // 2. Fast forward time past deadline
            await hre.network.provider.send("evm_increaseTime", [86401]);
            await hre.network.provider.send("evm_mine");

            // 3. Mark Defaulted
            await loan.connect(admin).markDefaulted();

            expect(await loan.status()).to.equal(3n); // 3 = DEFAULTED

            // 4. Check Credit Score (Base 500 - 50 = 450)
            const newScore = await creditScore.getScore(borrower.address);
            expect(newScore).to.equal(450n);
        });
    });
});
