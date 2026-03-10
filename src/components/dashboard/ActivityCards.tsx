"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Wallet, Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { useLoans } from "@/hooks/useLoans";
import { useWallet } from "@/contexts/WalletContext";
import { formatEther } from "ethers";

export function LendingActivityCard() {
    const { address } = useWallet();
    const { fetchLoans } = useLoans();
    const [totalFunded, setTotalFunded] = useState<bigint>(BigInt(0));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (address) {
            fetchLoans().then(loans => {
                const funded = loans
                    .filter(l => l.lender?.toLowerCase() === address.toLowerCase())
                    .reduce((acc, l) => acc + BigInt(l.principal), BigInt(0));
                setTotalFunded(funded);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [address, fetchLoans]);

    return (
        <Card variant="elevated" className="bg-white">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="size-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                        <TrendingUp className="size-5" />
                    </div>
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full uppercase">
                        Active
                    </span>
                </div>
                <div className="mt-4">
                    <p className="text-small font-medium text-gray-500 dark:text-gray-400">Total Invested</p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <h3 className="text-h3 font-bold text-gray-900 dark:text-white">{loading ? "..." : formatEther(totalFunded)}</h3>
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">CTC</span>
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-green-600">
                    <ArrowUpRight className="size-3" />
                    <span>Yield tracking enabled</span>
                </div>
            </CardContent>
        </Card>
    );
}

export function BorrowingActivityCard() {
    const { address } = useWallet();
    const { fetchLoans } = useLoans();
    const [totalBorrowed, setTotalBorrowed] = useState<bigint>(BigInt(0));
    const [activeCount, setActiveCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (address) {
            fetchLoans().then(loans => {
                const borrowing = loans.filter(l => l.borrower.toLowerCase() === address.toLowerCase());
                const total = borrowing.reduce((acc, l) => acc + BigInt(l.principal), BigInt(0));
                setTotalBorrowed(total);
                setActiveCount(borrowing.filter(l => l.status === "Active").length);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [address, fetchLoans]);

    return (
        <Card variant="elevated" className="bg-white">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="size-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <Wallet className="size-5" />
                    </div>
                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full uppercase">
                        {activeCount} Active
                    </span>
                </div>
                <div className="mt-4">
                    <p className="text-small font-medium text-gray-500 dark:text-gray-400">Total Borrowed</p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <h3 className="text-h3 font-bold text-gray-900 dark:text-white">{loading ? "..." : formatEther(totalBorrowed)}</h3>
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">CTC</span>
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs text-primary-600">
                    <ArrowDownRight className="size-3" />
                    <span>Next payment: Dynamic</span>
                </div>
            </CardContent>
        </Card>
    );
}
