/**
 * Contract addresses for CredTrust on Creditcoin testnet.
 * Update these when contracts are deployed.
 */
export const CONTRACT_ADDRESSES = {
  creditScore: process.env.NEXT_PUBLIC_CREDIT_SCORE_ADDRESS || "",
  loanFactory: process.env.NEXT_PUBLIC_LOAN_FACTORY_ADDRESS || "",
} as const;

export const SUPPORTED_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "0";

export const isContractConfigured = (): boolean =>
  Boolean(CONTRACT_ADDRESSES.creditScore && CONTRACT_ADDRESSES.loanFactory);
