const hre = require("hardhat");

async function main() {
    const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const code = await hre.ethers.provider.getCode(factoryAddress);

    if (code === "0x") {
        console.log(`NO CONTRACT FOUND AT ${factoryAddress}. Local node might not be running or contracts were not deployed to it.`);
    } else {
        console.log(`Contract found at ${factoryAddress}.`);
        const LoanFactory = await hre.ethers.getContractAt("LoanFactory", factoryAddress);
        try {
            const loans = await LoanFactory.listLoans();
            console.log(`Loans found: ${loans.length}`);
            loans.forEach((l, i) => console.log(`  ${i}: ${l}`));
        } catch (e) {
            console.log("Error calling listLoans:", e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
