// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CreditScoreContract.sol";

contract LoanContract {
    enum LoanStatus { REQUESTED, FUNDED, REPAID, DEFAULTED }

    LoanStatus public status;
    address public borrower;
    address public lender;
    uint256 public principal;
    uint256 public interestRate; // e.g., 5 means 5%
    uint256 public duration; // in seconds
    uint256 public deadline;
    
    CreditScoreContract public creditScoreContract;

    event LoanFunded(address indexed lender, uint256 amount);
    event LoanRepaid(uint256 amount);
    event LoanDefaulted();

    constructor(
        address _borrower,
        uint256 _principal,
        uint256 _interestRate,
        uint256 _duration,
        address _creditScoreContract
    ) {
        borrower = _borrower;
        principal = _principal;
        interestRate = _interestRate;
        duration = _duration;
        creditScoreContract = CreditScoreContract(_creditScoreContract);
        status = LoanStatus.REQUESTED;
    }

    function fundLoan() external payable {
        require(status == LoanStatus.REQUESTED, "Loan not request phase");
        require(msg.value == principal, "Incorrect funding amount");
        
        lender = msg.sender;
        status = LoanStatus.FUNDED;
        deadline = block.timestamp + duration;

        // Transfer funds to borrower
        payable(borrower).transfer(msg.value);
        
        emit LoanFunded(lender, msg.value);
    }

    function calculateTotalRepayment() public view returns (uint256) {
        // Simple interest: Principal + (Principal * Rate / 100)
        return principal + ((principal * interestRate) / 100);
    }

    function repayLoan() external payable {
        require(status == LoanStatus.FUNDED, "Loan not funded");
        require(msg.sender == borrower, "Only borrower can repay");
        
        uint256 totalRepayment = calculateTotalRepayment();
        require(msg.value == totalRepayment, "Incorrect repayment amount");

        status = LoanStatus.REPAID;

        // Transfer to lender
        payable(lender).transfer(msg.value);

        // Update Credit Score
        creditScoreContract.updateScore(borrower, true);

        emit LoanRepaid(msg.value);
    }

    function markDefaulted() external {
        require(status == LoanStatus.FUNDED, "Loan not funded");
        require(block.timestamp > deadline, "Deadline not passed");

        status = LoanStatus.DEFAULTED;

        // Update Credit Score
        // Note: For MVP we just call updateScore. 
        // In reality, lender loses funds unless there's collateral/insurance.
        creditScoreContract.updateScore(borrower, false);

        emit LoanDefaulted();
    }
}
