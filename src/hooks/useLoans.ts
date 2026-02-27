"use client";

import { useCallback, useState } from "react";
import { Contract, ethers, parseEther } from "ethers";
import type { CreateLoanParams, Loan, LoanStatus } from "@/types/loan";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACT_ADDRESSES, isContractConfigured } from "@/lib/contracts/config";
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

export function useLoans() {
  const { signer, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
        const interestRateBps = Math.round(parseFloat(params.interestRate) * 100); // 5% -> 500
        const tx = await factory.createLoan(
          parseEther(params.amount),
          interestRateBps,
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

  const fetchLoans = useCallback(async (): Promise<Loan[]> => {
    if (!signer || !isContractConfigured()) return [];

    try {
      const factory = new Contract(
        CONTRACT_ADDRESSES.loanFactory,
        LOAN_FACTORY_ABI,
        signer
      );
      const addrs = await factory.listLoans();

      const loans: Loan[] = [];
      for (let i = 0; i < addrs.length; i++) {
        const loanContract = new Contract(addrs[i], LOAN_ABI, signer);
        const [borrower, lender, principal, interestRateBps, durationDays, status, fundedAt, repaymentDeadline] =
          await Promise.all([
            loanContract.borrower(),
            loanContract.lender(),
            loanContract.principal(),
            loanContract.interestRateBps(),
            loanContract.durationDays(),
            loanContract.status(),
            loanContract.fundedAt(),
            loanContract.repaymentDeadline(),
          ]);

        // compute remaining by checking contract balance (works even if contract doesn't expose it)
        let remaining = "0";
        try {
          const balance = await signer.provider.getBalance(addrs[i]);
          const remBn = principal.sub(balance);
          remaining = remBn.gt(0) ? remBn.toString() : "0";
        } catch (e) {
          // ignore and leave remaining as 0 on failure
          remaining = "0";
        }

        loans.push({
        id: addrs[i],
          borrower,
          lender: lender === ethers.ZeroAddress ? null : lender,
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
    } catch {
      return [];
    }
  }, [signer]);

  const fetchCreditScore = useCallback(
    async (address: string): Promise<number> => {
      if (!signer || !isContractConfigured()) return 0;

      try {
        const creditScore = new Contract(
          CONTRACT_ADDRESSES.creditScore,
          CREDIT_SCORE_ABI,
          signer
        );
        const score = await creditScore.getScore(address);
        return Number(score);
      } catch {
        return 0;
      }
    },
    [signer]
  );

  return {
    createLoan,
    fetchLoans,
    fetchCreditScore,
    fundLoan,
    repayLoan,
    loading,
    actionLoading,
    error,
    isConfigured: isContractConfigured(),
  };
}
