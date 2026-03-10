// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Loan.sol";
import "./CreditScore.sol";

/**
 * @title LendingPool
 * @notice A professional liquidity pool vault where lenders deposit CTC to earn interest
 * and borrowers draw instant liquidity.
 */
contract LendingPool {
    string public constant name = "CredTrust Liquidity Vault";
    
    uint256 public totalShares;
    mapping(address => uint256) public shares;
    
    address public factory;
    ICreditScore public creditScore;

    event Deposited(address indexed user, uint256 amount, uint256 sharesMinted);
    event Withdrawn(address indexed user, uint256 amount, uint256 sharesBurned);
    event LoanFunded(address indexed loan, uint256 amount);
    event InterestEarned(uint256 amount);

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can fund loans");
        _;
    }

    constructor(address _factory, address _creditScore) {
        factory = _factory;
        creditScore = ICreditScore(_creditScore);
    }

    /**
     * @notice Deposit CTC into the pool to earn interest
     */
    function deposit() external payable {
        require(msg.value > 0, "Deposit must be > 0");
        
        uint256 sharesToMint;
        if (totalShares == 0) {
            sharesToMint = msg.value;
        } else {
            // shares = deposit * (totalShares / totalBalanceBefore)
            uint256 poolBalanceBefore = address(this).balance - msg.value;
            sharesToMint = (msg.value * totalShares) / poolBalanceBefore;
        }

        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;

        emit Deposited(msg.sender, msg.value, sharesToMint);
    }

    /**
     * @notice Withdraw CTC and earned interest from the pool
     * @param sharesToBurn Number of shares to convert back to CTC
     */
    function withdraw(uint256 sharesToBurn) external {
        require(sharesToBurn > 0 && shares[msg.sender] >= sharesToBurn, "Invalid shares");

        // amount = sharesToBurn * (totalBalance / totalShares)
        uint256 amountToWithdraw = (sharesToBurn * address(this).balance) / totalShares;

        shares[msg.sender] -= sharesToBurn;
        totalShares -= sharesToBurn;

        (bool sent, ) = msg.sender.call{value: amountToWithdraw}("");
        require(sent, "Transfer failed");

        emit Withdrawn(msg.sender, amountToWithdraw, sharesToBurn);
    }

    /**
     * @notice Funds an approved loan request instantly from the pool
     * @param loanAddress The address of the Loan contract to fund
     */
    function fundLoan(address payable loanAddress) external onlyFactory {
        Loan loan = Loan(loanAddress);
        require(loan.status() == Loan.Status.Requested, "Loan not requestable");
        
        uint256 amount = loan.principal();
        require(address(this).balance >= amount, "Insufficient pool liquidity");

        // Call the fund function on the loan contract
        loan.fund{value: amount}();
        
        emit LoanFunded(loanAddress, amount);
    }

    /**
     * @notice Returns the current value of a user's shares in CTC
     */
    function getBalanceOf(address user) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (shares[user] * address(this).balance) / totalShares;
    }

    /**
     * @notice Fallback to receive repayments from Loan contracts
     */
    receive() external payable {
        // Any CTC sent here (from Loan repayments) naturally increases the share value
        emit InterestEarned(msg.value);
    }
}
