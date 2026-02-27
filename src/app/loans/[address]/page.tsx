"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// using parseEther/formatEther below
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/contexts/WalletContext";
import { useLoans } from "@/hooks/useLoans";
import { LOAN_ABI } from "@/lib/contracts/abis";
import { Contract } from "ethers";
import { parseEther, formatEther } from "ethers";

export default function LoanDetailPage() {
  const params = useParams();
  const address = (params as any)?.address as string;
  const { signer, isConnected, address: userAddress } = useWallet();
  const { fetchCreditScore, fundLoan } = useLoans();

  const [loan, setLoan] = useState<any | null>(null);
  const [fundAmount, setFundAmount] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!address) return;
      setLoading(true);
      try {
        const provider = signer ? signer.provider : undefined;
        const rpcLoan = new Contract(address, LOAN_ABI, provider || undefined);
        const [borrower, lender, principal, interestRateBps, durationDays, status, fundedAt, repaymentDeadline] =
          await Promise.all([
            rpcLoan.borrower(),
            rpcLoan.lender(),
            rpcLoan.principal(),
            rpcLoan.interestRateBps(),
            rpcLoan.durationDays(),
            rpcLoan.status(),
            rpcLoan.fundedAt(),
            rpcLoan.repaymentDeadline(),
          ]);

        if (!mounted) return;
        let remaining = "0";
        try {
          if (provider) {
            const bal = await provider.getBalance(address);
            remaining = principal.sub(bal).toString();
          }
        } catch (e) {
          // ignore
        }

        setLoan({
          id: address,
          borrower,
          lender: lender === "0x0000000000000000000000000000000000000000" ? null : lender,
          principal: principal.toString(),
          remaining,
          interestRate: Number(interestRateBps) / 100,
          duration: Number(durationDays),
          status: Number(status),
          fundedAt: Number(fundedAt),
          repaymentDeadline: Number(repaymentDeadline),
        });

        // default fund amount to remaining or full principal
        setFundAmount(formatEther(remaining && remaining !== "0" ? remaining : principal));

        const sc = await fetchCreditScore(borrower);
        setScore(sc);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [address, signer, fetchCreditScore]);

  if (!address) return <div className="p-6">Loan address missing</div>;

  if (loading) return <div className="p-6">Loading loan…</div>;

  if (!loan) return <div className="p-6">Loan not found</div>;

  return (
    <div className="p-6">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Loan {loan.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>Borrower: {loan.borrower}</div>
            <div>Lender: {loan.lender ?? "—"}</div>
            <div>Principal: {formatEther(loan.principal)} CTC</div>
            <div>Interest: {loan.interestRate}%</div>
            <div>Duration: {loan.duration} days</div>
            <div>
              Funded at: {loan.fundedAt ? new Date(loan.fundedAt * 1000).toLocaleString() : "Not funded"}
            </div>
            <div>
              Repayment deadline: {loan.repaymentDeadline ? new Date(loan.repaymentDeadline * 1000).toLocaleString() : "—"}
            </div>
            <div>Status: {loan.status}</div>
            <div>Borrower score: {score ?? "—"}</div>
          </div>

          <div className="mt-4 flex gap-2">
            {loan.status === 0 && (
              <div className="flex items-center gap-2">
                <input
                  className="w-36 rounded border px-2 py-1"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="0.0"
                />
                <Button
                  onClick={async () => {
                    if (!isConnected || !signer) return;
                    try {
                      const amountWei = parseEther(fundAmount || formatEther(loan.principal)).toString();
                      await fundLoan(address, amountWei);
                      window.location.reload();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Fund Loan
                </Button>
              </div>
            )}

            {loan.status === 2 && userAddress?.toLowerCase() === loan.borrower.toLowerCase() && (
              <Button
                onClick={async () => {
                  if (!isConnected || !signer) return;
                  try {
                    const loanContract = new Contract(address, LOAN_ABI, signer);
                    const total = await loanContract.getTotalRepayment();
                    const tx = await loanContract.repay({ value: total });
                    await tx.wait();
                    window.location.reload();
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                Repay
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
