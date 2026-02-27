// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Loan.sol";
import "./CreditScore.sol";

/**
 * @title LoanFactory
 * @notice Creates loan instances and maintains registry
 */
contract LoanFactory {
    Loan[] public loans;
    CreditScore public creditScore;

    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 principal, uint256 interestRateBps, uint256 durationDays);

    constructor() {
        creditScore = new CreditScore(address(this));
    }

    function createLoan(
        uint256 principal,
        uint256 interestRateBps,
        uint256 durationDays
    ) external returns (uint256 loanId) {
        require(principal > 0, "Zero principal");
        require(interestRateBps <= 10000, "Invalid rate"); // max 100%
        require(durationDays >= 1 && durationDays <= 365, "Invalid duration");

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
}
