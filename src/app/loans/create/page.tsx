"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useWallet } from "@/contexts/WalletContext";
import { useLoans } from "@/hooks/useLoans";

const DURATION_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
];

export default function CreateLoanPage() {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { createLoan, loading } = useLoans();
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount);
    const rateNum = parseFloat(interestRate);

    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!interestRate || isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setError("Please enter a valid interest rate (0–100%)");
      return;
    }
    if (!duration) {
      setError("Please select a duration");
      return;
    }

    try {
      await createLoan({
        amount,
        interestRate,
        duration: parseInt(duration, 10),
      });
      router.push("/loans?created=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create loan");
    }
  };

  return (
    <div className="mx-auto max-w-container-md px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/loans"
        className="mb-8 inline-flex items-center gap-2 text-body text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="size-4" />
        Back to loans
      </Link>

      <h1 className="text-h2 font-bold text-gray-900">Create Loan Request</h1>
      <p className="mt-2 text-body text-gray-600">
        Request a loan. Lenders will see your credit score and can fund your
        request.
      </p>

      <Card variant="elevated" className="mt-12">
        <CardHeader>
          <CardTitle>Loan Details</CardTitle>
          <p className="text-small text-gray-500">
            Amount, interest rate, and repayment duration.
          </p>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <p className="py-8 text-center text-body text-gray-500">
              Connect your wallet to create a loan request.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <Input
                label="Amount (in CTC)"
                type="number"
                min="1"
                step="0.01"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                helperText="Principal amount you wish to borrow"
              />
              <Input
                label="Interest Rate (%)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                helperText="Annual percentage rate offered to lenders"
              />
              <Select
                label="Duration"
                options={DURATION_OPTIONS}
                placeholder="Select duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                helperText="Repayment deadline from funding date"
              />
              {error && (
                <p className="text-small text-error" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-4">
                <Button type="submit" loading={loading} size="lg">
                  Create Loan Request
                </Button>
                <Link href="/loans">
                  <Button type="button" variant="secondary" size="lg">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
