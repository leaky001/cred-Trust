// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CreditScoreContract
 * @dev Manages the on-chain reputation and credit scores of users.
 */
contract CreditScoreContract {
    struct CreditProfile {
        uint256 score;
        uint256 totalLoans;
        uint256 repaid;
        uint256 defaults;
    }

    mapping(address => CreditProfile) public profiles;
    
    // In MVP, only specific authorized contracts (e.g., LoanContracts) should update scores.
    // For simplicity in hackathon, we allow any caller, but in production, we need a modifier.
    address public admin;
    mapping(address => bool) public authorizedContracts;

    event ScoreUpdated(address indexed user, uint256 newScore, bool success);
    event ContractAuthorized(address indexed contractAddress, bool isAuthorized);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || msg.sender == admin, "Not authorized");
        _;
    }

    function authorizeContract(address _contract, bool _status) external onlyAdmin {
        authorizedContracts[_contract] = _status;
        emit ContractAuthorized(_contract, _status);
    }

    function getScore(address user) external view returns (uint256) {
        CreditProfile memory profile = profiles[user];
        if (profile.totalLoans == 0) {
            return 500; // Base score
        }
        return profile.score;
    }

    function updateScore(address user, bool success) external onlyAuthorized {
        CreditProfile storage profile = profiles[user];
        
        if (profile.totalLoans == 0) {
            profile.score = 500; // Initialize base score
        }

        profile.totalLoans++;

        if (success) {
            profile.repaid++;
            profile.score += 10; // Simple reward
            if (profile.score > 1000) profile.score = 1000; // Max cap
        } else {
            profile.defaults++;
            if (profile.score > 50) {
                profile.score -= 50; // Simple penalty
            } else {
                profile.score = 0;
            }
        }

        emit ScoreUpdated(user, profile.score, success);
    }
}
