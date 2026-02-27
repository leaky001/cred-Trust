// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICreditScore {
    function recordRepayment(address user, uint256 principal, bool onTime) external;
    function recordDefault(address user, uint256 principal) external;
}

/**
 * @title Loan
 * @notice Single loan agreement: Requested → Funded → Active → Repaid / Defaulted
 */
contract Loan {
    enum Status {
        Requested,
        Funded,
        Active,
        Repaid,
        Defaulted
    }

    address public borrower;
    address public lender;
    uint256 public principal;
    uint256 public interestRateBps; // basis points, e.g. 500 = 5%
    uint256 public durationDays;
    uint256 public fundedAt;
    uint256 public repaymentDeadline;

    Status public status;
    address public factory;
    ICreditScore public creditScore;

    event LoanFunded(address indexed lender, uint256 amount);
    event LoanRepaid(address indexed borrower, uint256 principal, uint256 interest);
    event LoanDefaulted(address indexed borrower);

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory");
        _;
    }

    modifier onlyBorrower() {
        require(msg.sender == borrower, "Only borrower");
        _;
    }

    constructor(
        address _borrower,
        uint256 _principal,
        uint256 _interestRateBps,
        uint256 _durationDays,
        address _factory,
        address _creditScore
    ) {
        borrower = _borrower;
        principal = _principal;
        interestRateBps = _interestRateBps;
        durationDays = _durationDays;
        factory = _factory;
        creditScore = ICreditScore(_creditScore);
        status = Status.Requested;
    }

    function fund() external payable {
        require(status == Status.Requested, "Invalid status");
        require(msg.value >= principal, "Insufficient funds");
        require(msg.sender != borrower, "Borrower cannot fund own loan");

        lender = msg.sender;
        fundedAt = block.timestamp;
        repaymentDeadline = block.timestamp + (durationDays * 1 days);
        status = Status.Active;

        emit LoanFunded(lender, principal);
    }

    function repay() external payable onlyBorrower {
        require(status == Status.Active, "Invalid status");

        uint256 interest = (principal * interestRateBps) / 10000;
        uint256 total = principal + interest;
        require(msg.value >= total, "Insufficient repayment");

        status = Status.Repaid;
        bool onTime = block.timestamp <= repaymentDeadline;

        creditScore.recordRepayment(borrower, principal, onTime);

        (bool sent,) = lender.call{value: total}("");
        require(sent, "Transfer failed");

        uint256 excess = msg.value - total;
        if (excess > 0) {
            (bool refund,) = borrower.call{value: excess}("");
            require(refund, "Refund failed");
        }

        emit LoanRepaid(borrower, principal, interest);
    }

    function markDefaulted() external onlyFactory {
        require(status == Status.Active, "Invalid status");
        require(block.timestamp > repaymentDeadline, "Not yet overdue");

        status = Status.Defaulted;
        creditScore.recordDefault(borrower, principal);

        if (address(this).balance > 0) {
            (bool sent,) = lender.call{value: address(this).balance}("");
            require(sent, "Transfer failed");
        }

        emit LoanDefaulted(borrower);
    }

    function getTotalRepayment() external view returns (uint256) {
        uint256 interest = (principal * interestRateBps) / 10000;
        return principal + interest;
    }
}
