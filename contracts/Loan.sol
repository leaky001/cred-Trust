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
    uint256 public principal;
    uint256 public interestRateBps; // basis points, e.g. 500 = 5%
    uint256 public durationDays;
    uint256 public fundedAt;
    uint256 public repaymentDeadline;
    uint256 public totalFunded;

    address[] public lenders;
    mapping(address => uint256) public contributions;

    Status public status;
    address public factory;
    ICreditScore public creditScore;

    event LoanFunded(address indexed lender, uint256 amount);
    event LoanPartiallyFunded(address indexed lender, uint256 amount, uint256 remaining);
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
        require(msg.sender != borrower, "Borrower cannot fund own loan");
        require(msg.value > 0, "No value sent");

        uint256 remaining = principal - totalFunded;
        uint256 amountToAccept = msg.value > remaining ? remaining : msg.value;

        if (contributions[msg.sender] == 0) {
            lenders.push(msg.sender);
        }
        contributions[msg.sender] += amountToAccept;
        totalFunded += amountToAccept;

        if (totalFunded == principal) {
            status = Status.Active;
            fundedAt = block.timestamp;
            repaymentDeadline = block.timestamp + (durationDays * 1 days);
            emit LoanFunded(msg.sender, amountToAccept);
        } else {
            emit LoanPartiallyFunded(msg.sender, amountToAccept, principal - totalFunded);
        }

        // Refund excess if borrower sent more than needed to fill principal
        if (msg.value > amountToAccept) {
            uint256 excess = msg.value - amountToAccept;
            (bool refund,) = msg.sender.call{value: excess}("");
            require(refund, "Refund failed");
        }
    }

    function repay() external payable onlyBorrower {
        require(status == Status.Active, "Invalid status");

        uint256 interest = (principal * interestRateBps) / 10000;
        uint256 total = principal + interest;
        require(msg.value >= total, "Insufficient repayment");

        status = Status.Repaid;
        bool onTime = block.timestamp <= repaymentDeadline;

        creditScore.recordRepayment(borrower, principal, onTime);

        // Distribute to all lenders
        for (uint256 i = 0; i < lenders.length; i++) {
            address lender = lenders[i];
            uint256 share = contributions[lender];
            uint256 lenderInterest = (share * interestRateBps) / 10000;
            uint256 lenderTotal = share + lenderInterest;
            
            (bool sent,) = lender.call{value: lenderTotal}("");
            require(sent, "Transfer failed to lender");
        }

        uint256 excess = msg.value - total;
        if (excess > 0) {
            (bool refund,) = borrower.call{value: excess}("");
            require(refund, "Refund failed");
        }

        emit LoanRepaid(borrower, principal, interest);
    }

    uint256 public constant GRACE_PERIOD = 3 days;

    function markDefaulted() external {
        require(status == Status.Active, "Invalid status");
        
        if (msg.sender != factory) {
            require(block.timestamp > repaymentDeadline + GRACE_PERIOD, "Grace period active");
        } else {
            require(block.timestamp > repaymentDeadline, "Not yet overdue");
        }

        status = Status.Defaulted;
        creditScore.recordDefault(borrower, principal);

        uint256 balance = address(this).balance;
        if (balance > 0) {
            // Distribute remaining balance across lenders proportionally
            for (uint256 i = 0; i < lenders.length; i++) {
                address lender = lenders[i];
                uint256 share = (contributions[lender] * balance) / principal;
                if (share > 0) {
                    (bool sent,) = lender.call{value: share}("");
                    require(sent, "Transfer failed to lender");
                }
            }
        }

        emit LoanDefaulted(borrower);
    }

    function getTotalRepayment() external view returns (uint256) {
        uint256 interest = (principal * interestRateBps) / 10000;
        return principal + interest;
    }

    function getLendersCount() external view returns (uint256) {
        return lenders.length;
    }
}
