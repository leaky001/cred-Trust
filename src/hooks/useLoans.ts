"use client";

import { useCallback, useMemo, useState } from "react";
import { Contract, ethers, parseEther, JsonRpcProvider } from "ethers";
import type { CreateLoanParams, Loan, LoanStatus } from "@/types/loan";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACT_ADDRESSES, isContractConfigured, SUPPORTED_CHAIN_ID, RPC_URL } from "@/lib/contracts/config";
import {
  LOAN_FACTORY_ABI,
  LOAN_ABI,
  CREDIT_SCORE_ABI,
} from "@/lib/contracts/abis";

const STATUS_MAP: Record<number, LoanStatus> = {
  0: "Requested",
  1: "Funded",
  2: "Active",
  3: "Repaid",
  4: "Defaulted",
};

const LENDING_POOL_ABI = [
  "function deposit() external payable",
  "function withdraw(uint256 sharesToBurn) external",
  "function getBalanceOf(address user) external view returns (uint256)",
  "function totalShares() external view returns (uint256)",
  "function shares(address) external view returns (uint256)",
]; // Simplified or use the full one from import

export function useLoans() {
  const { signer, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Read-only RPC provider (used for fetching listings reliably)
  const rpcProvider = useMemo(() => {
    if (typeof window === "undefined" || !isContractConfigured()) return null;
    try {
      return new JsonRpcProvider(RPC_URL);
    } catch {
      return null;
    }
  }, []);

  // Signer-backed provider (injected wallet) used for write actions
  const signerProvider = useMemo(() => {
    if (typeof window === "undefined") return null;
    return signer?.provider ?? null;
  }, [signer]);

  // (NO `provider` variable here) We'll compute an `activeProvider` inside
  // each callback so dependencies are explicit (rpcProvider, signerProvider, signer).

  const createLoan = useCallback(
    async (params: CreateLoanParams) => {
      if (!signer || !isConnected) {
        throw new Error("Wallet not connected");
      }

      if (!isContractConfigured()) {
        throw new Error(
          "Contracts not configured. Deploy with: npm run deploy:local"
        );
      }

      setLoading(true);
      setError(null);

      try {
        const factory = new Contract(
          CONTRACT_ADDRESSES.loanFactory,
          LOAN_FACTORY_ABI,
          signer
        );

        const tx = await factory.createLoan(
          parseEther(params.amount),
          params.duration
        );
        await tx.wait();
        return { success: true } as const;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create loan";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, isConnected]
  );

  const fundLoan = useCallback(
    async (loanAddress: string, amountWei: string) => {
      if (!signer || !isContractConfigured()) {
        throw new Error("Not ready: signer or contracts not configured");
      }
      setActionLoading(true);
      try {
        const loanContract = new Contract(loanAddress, LOAN_ABI, signer);
        const tx = await loanContract.fund({ value: amountWei });
        await tx.wait();
        return { success: true } as const;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fund loan";
        setError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [signer]
  );

  const repayLoan = useCallback(
    async (loanAddress: string) => {
      if (!signer || !isContractConfigured()) {
        throw new Error("Not ready: signer or contracts not configured");
      }
      setActionLoading(true);
      try {
        const loanContract = new Contract(loanAddress, LOAN_ABI, signer);
        // Prefer contract-provided total if available
        const total = await loanContract.getTotalRepayment();
        const tx = await loanContract.repay({ value: total });
        await tx.wait();
        return { success: true } as const;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to repay loan";
        setError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [signer]
  );

  const markDefaulted = useCallback(
    async (loanAddress: string) => {
      if (!signer || !isContractConfigured()) {
        throw new Error("Not ready: signer or contracts not configured");
      }
      setActionLoading(true);
      try {
        const loanContract = new Contract(loanAddress, LOAN_ABI, signer);
        const tx = await loanContract.markDefaulted();
        await tx.wait();
        return { success: true } as const;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to default loan";
        setError(message);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [signer]
  );

  const fetchLoans = useCallback(async (): Promise<Loan[]> => {
    if (!isContractConfigured()) return [];

    try {
  // Prefer the read-only RPC provider for listing to avoid wallet-injected
  // providers returning Internal JSON-RPC errors. Fall back to signer
  // provider only if RPC provider is not configured.
  const activeProvider = rpcProvider || signerProvider || signer?.provider;
      if (!activeProvider) return [];

      // Network Validation
      try {
        const network = await activeProvider.getNetwork();
        const currentChainId = network.chainId.toString();
        const expectedChainId = SUPPORTED_CHAIN_ID;

        if (isConnected && currentChainId !== expectedChainId && expectedChainId !== "0") {
          setError(`WRONG_NETWORK:${expectedChainId}`);
          return [];
        }
      } catch (netErr) {
        console.warn("Could not verify network:", netErr);
      }

      const factory = new Contract(
        CONTRACT_ADDRESSES.loanFactory,
        LOAN_FACTORY_ABI,
        activeProvider
      );
      const addrs = await factory.listLoans();

      const loans: Loan[] = [];
      for (let i = 0; i < addrs.length; i++) {
        const loanContract = new Contract(addrs[i], LOAN_ABI, activeProvider!);
        const [
          borrower,
          principal,
          interestRateBps,
          durationDays,
          status,
          fundedAt,
          repaymentDeadline,
          totalFunded,
          lendersCount,
        ] = await Promise.all([
          loanContract.borrower(),
          loanContract.principal(),
          loanContract.interestRateBps(),
          loanContract.durationDays(),
          loanContract.status(),
          loanContract.fundedAt(),
          loanContract.repaymentDeadline(),
          loanContract.totalFunded(),
          loanContract.getLendersCount(),
        ]);

        let lenderAddr: string | null = null;
        if (Number(lendersCount) > 0) {
          lenderAddr = await loanContract.lenders(0);
        }

        let remaining = "0";
        const remBn = (principal as bigint) - (totalFunded as bigint);
        remaining = remBn > BigInt(0) ? remBn.toString() : "0";

        loans.push({
          id: addrs[i],
          borrower,
          lender: lenderAddr === ethers.ZeroAddress ? null : lenderAddr,
          lendersCount: Number(lendersCount),
          totalFunded: totalFunded.toString(),
          principal: principal.toString(),
          remaining,
          interestRate: (Number(interestRateBps) / 100).toString(),
          duration: Number(durationDays),
          status: STATUS_MAP[Number(status)] ?? "Requested",
          createdAt: 0,
          fundedAt: fundedAt > 0 ? Number(fundedAt) : undefined,
          repaymentDeadline:
            repaymentDeadline > 0 ? Number(repaymentDeadline) : undefined,
        });
      }
      return loans;
      } catch (err) {
      console.error("fetchLoans error:", err);
      const message = err instanceof Error ? err.message : String(err);
      // Handle known failure modes with actionable messages
      if (message.includes("could not decode result data") || message.includes("0x")) {
        setError(`Contract Interaction Failed: The app found address ${CONTRACT_ADDRESSES.loanFactory} but it has no code on your current wallet's network. (Expected Chain: ${SUPPORTED_CHAIN_ID})`);
      } else if (message.includes("ECONNREFUSED")) {
        setError(`Blockchain connection failed. Ensure the testnet RPC (${RPC_URL}) is reachable and that your node (e.g. Hardhat) is running.`);
      } else if (message.includes('Internal JSON-RPC error') || message.includes('-32603')) {
        setError('Internal JSON-RPC error from your wallet or node. Check that MetaMask is connected to the correct network (Localhost:8545 for local) and that the node is running.');
      } else {
        setError(message);
      }
      return [];
    }
  }, [signer, rpcProvider, signerProvider, isConnected]);

  const fetchLoanDetails = useCallback(
    async (loanAddress: string): Promise<Loan & { totalRepayment: string }> => {
      const activeProvider = rpcProvider || signerProvider || signer?.provider;
      if (!activeProvider || !isContractConfigured()) {
        throw new Error("Provider or contracts not configured");
      }

      const loanContract = new Contract(loanAddress, LOAN_ABI, activeProvider);
      const [
        borrower,
        principal,
        interestRateBps,
        durationDays,
        status,
        fundedAt,
        repaymentDeadline,
        totalRepayment,
        totalFunded,
        lendersCount,
      ] = await Promise.all([
        loanContract.borrower(),
        loanContract.principal(),
        loanContract.interestRateBps(),
        loanContract.durationDays(),
        loanContract.status(),
        loanContract.fundedAt(),
        loanContract.repaymentDeadline(),
        loanContract.getTotalRepayment(),
        loanContract.totalFunded(),
        loanContract.getLendersCount(),
      ]);

      let lenderAddr: string | null = null;
      if (Number(lendersCount) > 0) {
        lenderAddr = await loanContract.lenders(0);
      }

      let remaining = "0";
      const remBn = (principal as bigint) - (totalFunded as bigint);
      remaining = remBn > BigInt(0) ? remBn.toString() : "0";

      return {
        id: loanAddress,
        borrower,
        lender: lenderAddr === ethers.ZeroAddress ? null : lenderAddr,
        lendersCount: Number(lendersCount),
        totalFunded: totalFunded.toString(),
        principal: principal.toString(),
        totalRepayment: totalRepayment.toString(),
        remaining,
        interestRate: (Number(interestRateBps) / 100).toString(),
        duration: Number(durationDays),
        status: STATUS_MAP[Number(status)] ?? "Requested",
        createdAt: 0,
        fundedAt: fundedAt > 0 ? Number(fundedAt) : undefined,
        repaymentDeadline:
          repaymentDeadline > 0 ? Number(repaymentDeadline) : undefined,
      };
    },
  [signer, rpcProvider, signerProvider]
  );

  const fetchCreditScore = useCallback(
    async (userAddress: string): Promise<number> => {
      if (!isContractConfigured()) return 0;

      const activeProvider = rpcProvider || signerProvider || signer?.provider;
      if (!activeProvider) return 0;

      try {
        const creditScore = new Contract(
          CONTRACT_ADDRESSES.creditScore,
          CREDIT_SCORE_ABI,
          activeProvider
        );
        const score = await creditScore.getScore(userAddress);
        return Number(score);
      } catch (err) {
        console.error("fetchCreditScore error:", err);
        return 0;
      }
    },
  [signer, rpcProvider, signerProvider]
  );

  const getAlgorithmicInterestRate = useCallback(
    async (userAddress: string): Promise<number> => {
      if (!isContractConfigured()) return 0;

      const activeProvider = rpcProvider || signerProvider || signer?.provider;
      if (!activeProvider) return 0;

      try {
        const creditScore = new Contract(
          CONTRACT_ADDRESSES.creditScore,
          CREDIT_SCORE_ABI,
          activeProvider
        );
        const rateBps = await creditScore.calculateInterestRate(userAddress);
        return Number(rateBps) / 100; // Returns APY %
      } catch (err) {
        console.error("getAlgorithmicInterestRate error:", err);
        return 0;
      }
    },
  [signer, rpcProvider, signerProvider]
  );

  const getPoolAddress = useCallback(async () => {
    const activeProvider = rpcProvider || signerProvider || signer?.provider;
    if (!activeProvider) return null;
    const factory = new Contract(CONTRACT_ADDRESSES.loanFactory, LOAN_FACTORY_ABI, activeProvider);
    return await factory.getLendingPool();
  }, [rpcProvider, signerProvider, signer]);

  const depositToPool = useCallback(async (amount: string) => {
    if (!signer) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const poolAddr = await getPoolAddress();
      const pool = new Contract(poolAddr!, LENDING_POOL_ABI, signer);
      const tx = await pool.deposit({ value: parseEther(amount) });
      await tx.wait();
    } finally {
      setLoading(false);
    }
  }, [signer, getPoolAddress]);

  const withdrawFromPool = useCallback(async (shares: string) => {
    if (!signer) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const poolAddr = await getPoolAddress();
      const pool = new Contract(poolAddr!, LENDING_POOL_ABI, signer);
      const tx = await pool.withdraw(shares);
      await tx.wait();
    } finally {
      setLoading(false);
    }
  }, [signer, getPoolAddress]);

  const fetchPoolStats = useCallback(async () => {
    const activeProvider = rpcProvider || signerProvider || signer?.provider;
    if (!activeProvider) return null;
    try {
      const poolAddr = await getPoolAddress();
      const pool = new Contract(poolAddr!, LENDING_POOL_ABI, activeProvider);
      const [totalLiquidity, totalShares] = await Promise.all([
        activeProvider.getBalance(poolAddr!),
        pool.totalShares(),
      ]);

      let userBalance = "0";
      let userShares = "0";
      if (signer) {
        const addr = await signer.getAddress();
        const [bal, sh] = await Promise.all([
          pool.getBalanceOf(addr),
          pool.shares(addr)
        ]);
        userBalance = bal.toString();
        userShares = sh.toString();
      }

      return {
        totalLiquidity: totalLiquidity.toString(),
        totalShares: totalShares.toString(),
        userBalance,
        userShares,
        poolAddress: poolAddr
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [rpcProvider, signerProvider, signer, getPoolAddress]);

  const borrowFromPool = useCallback(async (params: CreateLoanParams) => {
    if (!signer) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const factory = new Contract(CONTRACT_ADDRESSES.loanFactory, LOAN_FACTORY_ABI, signer);
      const tx = await factory.borrowFromPool(parseEther(params.amount), params.duration);
      await tx.wait();
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return {
    createLoan,
    borrowFromPool,
    depositToPool,
    withdrawFromPool,
    fetchPoolStats,
    fetchLoans,
    fetchLoanDetails,
    fetchCreditScore,
    getAlgorithmicInterestRate,
    fundLoan,
    repayLoan,
    markDefaulted,
    loading,
    actionLoading,
    error,
    isConfigured: isContractConfigured(),
  };
}
