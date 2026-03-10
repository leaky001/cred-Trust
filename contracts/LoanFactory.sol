// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Loan.sol";
import "./CreditScore.sol";
import "./LendingPool.sol";

/**
 * @title LoanFactory
 * @notice Creates loan instances and maintains registry
 */
contract LoanFactory {
    Loan[] public loans;
    CreditScore public creditScore;
    LendingPool public lendingPool;

    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 principal, uint256 interestRateBps, uint256 durationDays);

    constructor() {
        creditScore = new CreditScore(address(this));
        lendingPool = new LendingPool(address(this), address(creditScore));
    }

    function createLoan(
        uint256 principal,
        uint256 durationDays
    ) external returns (uint256 loanId) {
        require(principal > 0, "Zero principal");
        require(durationDays >= 1 && durationDays <= 365, "Invalid duration");

        uint256 interestRateBps = creditScore.calculateInterestRate(msg.sender);

        Loan loan = new Loan(
            msg.sender,
            principal,
            interestRateBps,
            durationDays,
            address(this),
            address(creditScore)
        );

        loanId = loans.length;
        loans.push(loan);

        creditScore.addApprovedLoan(address(loan));
        creditScore.recordLoanRequest(msg.sender, principal);

        emit LoanCreated(loanId, msg.sender, principal, interestRateBps, durationDays);
    }

    function getLoan(uint256 loanId) external view returns (address) {
        require(loanId < loans.length, "Invalid loan");
        return address(loans[loanId]);
    }

    function getCreditScore() external view returns (address) {
        return address(creditScore);
    }

    function listLoans() external view returns (address[] memory) {
        address[] memory addrs = new address[](loans.length);
        for (uint256 i = 0; i < loans.length; i++) {
            addrs[i] = address(loans[i]);
        }
        return addrs;
    }

    function loanCount() external view returns (uint256) {
        return loans.length;
    }

    function markLoanDefaulted(uint256 loanId) external {
        require(loanId < loans.length, "Invalid loan");
        loans[loanId].markDefaulted();
    }

    /**
     * @notice Creates a loan and funds it instantly from the protocol pool
     */
    function borrowFromPool(
        uint256 principal,
        uint256 durationDays
    ) external returns (uint256 loanId) {
        // 1. Create the loan (re-using createLoan logic for consistency)
        loanId = this.createLoan(principal, durationDays);
        address loanAddr = address(loans[loanId]);

        // 2. Fund it instantly from the pool
        lendingPool.fundLoan(payable(loanAddr));
    }

    function getLendingPool() external view returns (address) {
        return address(lendingPool);
    }
}
