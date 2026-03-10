const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Load .env.local manually since dotenv defaults to .env
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, { encoding: "utf8" });
    raw.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^([^=]+)=([\s\S]*)$/);
      if (match) process.env[match[1]] = match[2];
    });
  }

  const factoryAddress = process.env.NEXT_PUBLIC_LOAN_FACTORY_ADDRESS;
  if (!factoryAddress) {
    throw new Error("Missing NEXT_PUBLIC_LOAN_FACTORY_ADDRESS in .env.local");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Seeding pool using account:", deployer.address);

  const Factory = await hre.ethers.getContractAt("LoanFactory", factoryAddress);
  const poolAddress = await Factory.getLendingPool();
  console.log("Found LendingPool at:", poolAddress);

  const Pool = await hre.ethers.getContractAt("LendingPool", poolAddress);
  
  const amountToSeed = hre.ethers.parseEther("5"); // 5 CTC
  console.log(`Depositing ${hre.ethers.formatEther(amountToSeed)} CTC into the pool for instant funding...`);

  const tx = await Pool.deposit({ value: amountToSeed });
  await tx.wait();

  console.log("✅ Successfully seeded the LendingPool!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
