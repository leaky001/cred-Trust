"use client";
"use client";

import { useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLoans } from "@/hooks/useLoans";
import { useWallet } from "@/contexts/WalletContext";
import type { Loan } from "@/types/loan";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Toast } from "@/components/ui/Toast";

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function LoansList() {
  const { fetchLoans, fetchCreditScore, isConfigured, fundLoan, repayLoan, actionLoading } = useLoans();
  const { address } = useWallet();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"fund" | "repay" | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);
  const [fundAmount, setFundAmount] = useState<string>("");
  const [fundError, setFundError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    let mounted = true;
    fetchLoans()
      .then((data) => {
        if (mounted) setLoans(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [fetchLoans, isConfigured]);

  useEffect(() => {
    if (!isConfigured || loans.length === 0) return;
    const loadScores = async () => {
      const map: Record<string, number> = {};
      for (const loan of loans) {
        const score = await fetchCreditScore(loan.borrower);
        map[loan.borrower] = score;
      }
      setScores(map);
    };
    loadScores();
  }, [fetchCreditScore, isConfigured, loans]);

  if (!isConfigured) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 bg-surface-secondary/50 p-12 text-center">
        <p className="text-body text-gray-500">
          Deploy contracts first: <code className="rounded bg-gray-100 px-2 py-1 text-small">npm run deploy:local</code>
        </p>
        <p className="mt-2 text-small text-gray-400">Then add the addresses to .env.local</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-body text-gray-500">Loading loans…</p>
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-surface-secondary/50 p-12 text-center">
        <p className="text-body text-gray-500">No loan requests yet.</p>
        <p className="mt-1 text-small text-gray-400">Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loans.map((loan) => (
        <Card key={loan.id} variant="elevated" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardContent className="flex-1">
            <CardTitle className="text-h4">
              {formatEther(loan.principal)} CTC · {loan.interestRate}% · {loan.duration} days
            </CardTitle>
            <p className="mt-1 text-small text-gray-500">
              Borrower: {formatAddress(loan.borrower)}
              {scores[loan.borrower] != null && <span className="ml-2">Score: {scores[loan.borrower]}</span>}
            </p>
            <p className="text-small">
              Status: <span className="font-medium text-primary-600">{loan.status}</span>
            </p>
          </CardContent>
          {loan.status === "Requested" && (
            <div className="shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedLoan(loan);
                  setConfirmAction("fund");
                  setFundAmount(formatEther((loan.remaining && loan.remaining !== "0") ? loan.remaining : loan.principal));
                  setFundError(null);
                  setConfirmOpen(true);
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing…" : "Fund Loan"}
              </Button>
            </div>
          )}
          {loan.status === "Active" && address?.toLowerCase() === loan.borrower.toLowerCase() && (
            <div className="shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedLoan(loan);
                  setConfirmAction("repay");
                  setConfirmOpen(true);
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing…" : "Repay"}
              </Button>
            </div>
          )}
        </Card>
      ))}

      <ConfirmModal
        open={confirmOpen}
        title={confirmAction === "fund" ? "Confirm funding" : "Confirm repayment"}
        description={
          confirmAction === "fund"
            ? `Fund loan ${selectedLoan ? formatAddress(selectedLoan.borrower) : ""} for ${
                selectedLoan ? formatEther(selectedLoan.principal) : ""
              } CTC?`
            : `Repay loan ${selectedLoan ? formatAddress(selectedLoan.borrower) : ""}?`
        }
        confirmLabel={confirmAction === "fund" ? "Fund" : "Repay"}
        cancelLabel="Cancel"
        confirmDisabled={confirmAction === "fund" && !!fundError}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedLoan(null);
          setConfirmAction(null);
        }}
        onConfirm={async () => {
          if (!selectedLoan || !confirmAction) return;
          setConfirmOpen(false);
          try {
            if (confirmAction === "fund") {
              // validate again before sending
              const numeric = Number(fundAmount);
              const remainingWei = selectedLoan?.remaining ?? selectedLoan.principal;
              const remainingDecimal = Number(formatEther(remainingWei));
              if (isNaN(numeric) || numeric <= 0) throw new Error("Invalid amount");
              if (numeric > remainingDecimal) throw new Error("Amount exceeds remaining funding needed");

              const amountWei = parseEther(fundAmount || formatEther(selectedLoan.principal)).toString();
              await fundLoan(selectedLoan.id, amountWei);
              setToast({ message: `Funded loan ${formatAddress(selectedLoan.borrower)}`, type: "success" });
            } else {
              await repayLoan(selectedLoan.id);
              setToast({ message: `Repayment submitted for ${formatAddress(selectedLoan.borrower)}`, type: "success" });
            }
            setLoading(true);
            const updated = await fetchLoans();
            setLoans(updated);
          } catch (err: any) {
            setToast({ message: `Action failed: ${err?.message ?? String(err)}`, type: "error" });
          } finally {
            setSelectedLoan(null);
            setConfirmAction(null);
            setLoading(false);
          }
        }}
      >
        {confirmAction === "fund" && (
          <div className="mb-4">
            <label className="text-small text-gray-600">Amount to fund (CTC)</label>
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={fundAmount}
              onChange={(e) => {
                setFundAmount(e.target.value);
                // inline validation
                const val = Number(e.target.value);
                if (!selectedLoan) return;
                const rem = Number(formatEther(selectedLoan.remaining ?? selectedLoan.principal));
                if (isNaN(val) || val <= 0) {
                  setFundError("Enter an amount greater than 0");
                } else if (val > rem) {
                  setFundError("Amount exceeds remaining required");
                } else {
                  setFundError(null);
                }
              }}
              placeholder="0.0"
              type="number"
              min="0"
              step="any"
            />
            <p className="text-small text-gray-400 mt-1">Remaining: {selectedLoan ? formatEther(selectedLoan.remaining ?? selectedLoan.principal) : "—"} CTC</p>
            {fundError && <p className="text-small text-red-600 mt-1">{fundError}</p>}
          </div>
        )}
      </ConfirmModal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
