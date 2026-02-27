import hre from "hardhat";

async function main() {
    console.log("Starting deployment...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy CreditScoreContract
    console.log("Deploying CreditScoreContract...");
    const CreditScoreContract = await hre.ethers.getContractFactory("CreditScoreContract");
    const creditScore = await CreditScoreContract.deploy();
    await creditScore.waitForDeployment();
    const creditScoreAddress = await creditScore.getAddress();
    console.log("CreditScoreContract deployed to:", creditScoreAddress);

    // Deploy LoanFactoryContract
    console.log("Deploying LoanFactoryContract...");
    const LoanFactoryContract = await hre.ethers.getContractFactory("LoanFactoryContract");
    const loanFactory = await LoanFactoryContract.deploy(creditScoreAddress);
    await loanFactory.waitForDeployment();
    const loanFactoryAddress = await loanFactory.getAddress();
    console.log("LoanFactoryContract deployed to:", loanFactoryAddress);

    // Authorize LoanFactory to update scores (or any loans it creates)
    // In a real scenario, the Factory creates Loans, so either we authorize loans individually 
    // or authorize the Factory. However, loans call `updateScore`, so we authorize the Factory 
    // to authorize the loans, or simpler: admin authorizes all created loans (which isn't scalable).
    // For MVP, we'll authorize the factory, and in `CreditScoreContract`, `admin` could manually add others.
    // Actually, wait, our auth model requires Loans to be authorized.
    // We'll let the user authorize loans later or loosen it for the hackathon MVP.
    console.log("Authorizing LoanFactory on CreditScoreContract...");
    await creditScore.authorizeContract(loanFactoryAddress, true);
    console.log("LoanFactory authorized.");

    console.log("\nDeployment completed successfully!");
    console.log("-----------------------------------------");
    console.log("CreditScoreContract Address:", creditScoreAddress);
    console.log("LoanFactoryContract Address:", loanFactoryAddress);
    console.log("-----------------------------------------");
    console.log("Next steps: Update your frontend env with these addresses!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
