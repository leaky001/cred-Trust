// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./LoanContract.sol";

contract LoanFactoryContract {
    address[] public allLoans;
    address public creditScoreContract;
    
    event LoanCreated(address indexed loanAddress, address indexed borrower, uint256 principal);

    constructor(address _creditScoreContract) {
        creditScoreContract = _creditScoreContract;
    }

    function createLoanRequest(
        uint256 _principal,
        uint256 _interestRate,
        uint256 _duration
    ) external {
        LoanContract newLoan = new LoanContract(
            msg.sender,
            _principal,
            _interestRate,
            _duration,
            creditScoreContract
        );
        
        allLoans.push(address(newLoan));
        
        emit LoanCreated(address(newLoan), msg.sender, _principal);
    }

    function getAllLoans() external view returns (address[] memory) {
        return allLoans;
    }
}
