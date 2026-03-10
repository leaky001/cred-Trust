"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useLoans } from "@/hooks/useLoans";
import type { Loan } from "@/types/loan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Briefcase, LineChart, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { ethers } from "ethers";
import Link from "next/link";
import { cn } from "@/lib/utils";

const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

export default function PortfolioPage() {
    const { address, isConnected } = useWallet();
    const { fetchLoans } = useLoans();

    const [borrowedLoans, setBorrowedLoans] = useState<Loan[]>([]);
    const [fundedLoans, setFundedLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!isConnected || !address) {
                setLoading(false);
                return;
            }

            try {
                const allLoans = await fetchLoans();
                if (mounted) {
                    setBorrowedLoans(allLoans.filter(l => l.borrower.toLowerCase() === address.toLowerCase()));
                    setFundedLoans(allLoans.filter(l => l.lender?.toLowerCase() === address.toLowerCase()));
                }
            } catch (err) {
                console.error("Failed to load portfolio:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [isConnected, address, fetchLoans]);

    if (!isConnected) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center p-4 text-center">
                <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary-500/10">
                    <WalletIcon className="size-10 text-primary-500" />
                </div>
                <h2 className="text-h3 font-bold text-gray-900 dark:text-white">Connect Wallet to View Portfolio</h2>
                <p className="mt-2 max-w-md text-gray-500 dark:text-gray-400">
                    Your portfolio holds all your active borrows and funded loans securely tracked via the blockchain.
                </p>
            </div>
        );
    }

    const totalBorrowed = borrowedLoans.reduce((sum, l) => sum + Number(ethers.formatEther(l.principal)), 0);
    const totalFunded = fundedLoans.reduce((sum, l) => sum + Number(ethers.formatEther(l.principal)), 0);

    return (
        <div className="relative isolate min-h-screen bg-transparent pb-24">
            {/* Background Decorative Glow */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] size-[30%] rounded-full bg-primary-500/10 blur-[100px]" />
            </div>

            <div className="mx-auto max-w-container-xl px-4 py-12 sm:px-6 lg:px-8">
                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-8">

                    <motion.div variants={itemVariants}>
                        <h1 className="text-h2 font-bold tracking-tight text-slate-900 dark:text-white">
                            My <span className="text-gradient-primary">Portfolio</span>
                        </h1>
                        <p className="mt-2 text-body text-slate-600 dark:text-slate-400">
                            Track your active debts and yield-generating assets in one place.
                        </p>
                    </motion.div>

                    {/* KPI Cards */}
                    <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="glass-card flex flex-col justify-between overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-small font-medium text-slate-500 dark:text-slate-400">Total Borrowed</p>
                                    <div className="rounded-full bg-red-500/10 p-2 text-red-500 dark:bg-red-500/20 dark:text-red-400">
                                        <ArrowDownRight className="size-4" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-h3 font-bold text-slate-900 dark:text-white">{totalBorrowed.toFixed(2)}</span>
                                    <span className="text-small font-medium text-slate-500">CTC</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Across {borrowedLoans.length} active request(s)</p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card flex flex-col justify-between overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 size-24 rounded-full bg-primary-500/10 blur-2xl" />
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <p className="text-small font-medium text-slate-500 dark:text-slate-400">Total Yield Assets</p>
                                    <div className="rounded-full bg-green-500/10 p-2 text-green-500 dark:bg-green-500/20 dark:text-green-400">
                                        <ArrowUpRight className="size-4" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-h3 font-bold text-slate-900 dark:text-white">{totalFunded.toFixed(2)}</span>
                                    <span className="text-small font-medium text-slate-500">CTC</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">Across {fundedLoans.length} funded loan(s)</p>
                            </CardContent>
                        </Card>

                        <Card className="glass-card flex flex-col justify-between overflow-hidden sm:col-span-2 lg:col-span-1 border-primary-500/20 bg-primary-500/5">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-small font-bold tracking-wider text-primary-600 dark:text-primary-400 uppercase">Portfolio Health</p>
                                    <Activity className="size-4 text-primary-500" />
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-small mb-2">
                                        <span className="text-slate-600 dark:text-slate-300">Repayment Capacity</span>
                                        <span className="font-bold text-green-500">Healthy</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Main Lists */}
                    <div className="mt-8 grid gap-8 lg:grid-cols-2">

                        {/* Borrowed List */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <Briefcase className="size-5 text-primary-500" />
                                <h3 className="text-h4 font-bold">My Borrows</h3>
                            </div>

                            {loading ? (
                                <div className="glass-card flex h-48 items-center justify-center rounded-2xl">
                                    <div className="size-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                                </div>
                            ) : borrowedLoans.length === 0 ? (
                                <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                                    <p className="text-small text-slate-500">No active borrows.</p>
                                    <Link href="/loans/create" className="mt-2 text-small font-medium text-primary-500 hover:text-primary-600">
                                        Create a request &rarr;
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {borrowedLoans.map((loan) => (
                                        <Link key={loan.id} href={`/loans/${loan.id}`}>
                                            <Card className="glass-card transition-all hover:scale-[1.02] hover:shadow-glow-primary/20">
                                                <CardContent className="flex items-center justify-between p-4">
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{ethers.formatEther(loan.principal)} CTC</p>
                                                        <p className="text-xs text-slate-500">Status: <span className="font-medium text-primary-500">{loan.status}</span></p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-small font-medium text-slate-600 dark:text-slate-300">{loan.interestRate}% APY</p>
                                                        <p className="text-xs text-slate-500">{loan.duration} Days</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Funded List */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <LineChart className="size-5 text-accent-500" />
                                <h3 className="text-h4 font-bold">Funded Assets</h3>
                            </div>

                            {loading ? (
                                <div className="glass-card flex h-48 items-center justify-center rounded-2xl">
                                    <div className="size-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
                                </div>
                            ) : fundedLoans.length === 0 ? (
                                <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                                    <p className="text-small text-slate-500">No active yields.</p>
                                    <Link href="/loans" className="mt-2 text-small font-medium text-accent-500 hover:text-accent-600">
                                        Browse marketplace &rarr;
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {fundedLoans.map((loan) => (
                                        <Link key={loan.id} href={`/loans/${loan.id}`}>
                                            <Card className="glass-card transition-all hover:scale-[1.02] hover:shadow-glow-accent/20">
                                                <CardContent className="flex items-center justify-between p-4">
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{ethers.formatEther(loan.principal)} CTC</p>
                                                        <p className="text-xs text-slate-500">Status: <span className="font-medium text-accent-500">{loan.status}</span></p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-small font-medium text-green-500 dark:text-green-400">+{loan.interestRate}% APY</p>
                                                        <p className="text-xs text-slate-500">{loan.duration} Days</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
