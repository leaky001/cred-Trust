const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  if (!deployer) {
    throw new Error("No deployer found. Check if the private key is configured correctly in hardhat.config.js and .env");
  }
  console.log("Deploying with account:", deployer.address);

  const LoanFactory = await hre.ethers.getContractFactory("LoanFactory");
  const factory = await LoanFactory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  const creditScoreAddress = await factory.getCreditScore();

  console.log("LoanFactory deployed to:", factoryAddress);
  console.log("CreditScore deployed to:", creditScoreAddress);

  console.log("\nSuggested .env.local entries:");
  const envLines = [
    `NEXT_PUBLIC_LOAN_FACTORY_ADDRESS=${factoryAddress}`,
    `NEXT_PUBLIC_CREDIT_SCORE_ADDRESS=${creditScoreAddress}`,
  ];
  envLines.forEach((l) => console.log(l));

  // Optionally write these entries to .env.local to make local frontend dev easier.
  // Use either the --write-env CLI flag or the WRITE_ENV=true env var.
  const writeEnvFlag = process.argv.includes("--write-env") || process.env.WRITE_ENV === "true";
  if (writeEnvFlag) {
    const fs = require("fs");
    const path = require("path");
    const envPath = path.resolve(process.cwd(), ".env.local");
    // Read existing file (if any) and preserve other keys
    let existing = {};
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, { encoding: "utf8" });
      raw.split(/\r?\n/).forEach((line) => {
        const m = line.match(/^([^=]+)=([\s\S]*)$/);
        if (m) existing[m[1]] = m[2];
      });
    }
    envLines.forEach((line) => {
      const [k, v] = line.split("=");
      existing[k] = v;
    });
    const out = Object.keys(existing)
      .map((k) => `${k}=${existing[k]}`)
      .join("\n") + "\n";
    fs.writeFileSync(envPath, out, { encoding: "utf8" });
    console.log(`Wrote NEXT_PUBLIC_* entries to ${envPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
