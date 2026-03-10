const hre = require("hardhat");

async function main() {
    const factoryAddress = process.env.NEXT_PUBLIC_LOAN_FACTORY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const creditScoreAddress = process.env.NEXT_PUBLIC_CREDIT_SCORE_ADDRESS || "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be";

    const factoryCode = await hre.ethers.provider.getCode(factoryAddress);
    const creditScoreCode = await hre.ethers.provider.getCode(creditScoreAddress);

    console.log(`Factory code at ${factoryAddress}: ${factoryCode === '0x' ? 'EMPTY' : 'DEPLOYED'}`);
    console.log(`CreditScore code at ${creditScoreAddress}: ${creditScoreCode === '0x' ? 'EMPTY' : 'DEPLOYED'}`);

    if (factoryCode !== '0x') {
        const factory = await hre.ethers.getContractAt("LoanFactory", factoryAddress);
        try {
            const count = await factory.loanCount();
            console.log(`Loan count: ${count}`);

            const list = await factory.listLoans();
            console.log(`Loans list: ${list.join(', ')}`);
        } catch (e) {
            console.log("Error calling loanCount/listLoans:", e.message);
        }
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
