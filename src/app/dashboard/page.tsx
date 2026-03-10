"use client";

import { CreditScoreCard } from "@/components/dashboard/CreditScoreCard";
import { LendingActivityCard, BorrowingActivityCard } from "@/components/dashboard/ActivityCards";
import { LoansList } from "@/app/loans/LoansList";
import { useWallet } from "@/contexts/WalletContext";
import { Shield, Sparkles, LayoutDashboard, TrendingUp, History as HistoryIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const { address, isConnected } = useWallet();

  return (
    <div className="relative isolate min-h-screen bg-transparent pb-24">
      {/* Background Decorative Glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] size-[40%] rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] size-[30%] rounded-full bg-accent-500/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-container-xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col gap-12"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-500">
              <LayoutDashboard className="size-3.5" />
              Central Command
            </div>
            <h1 className="text-h2 font-bold tracking-tight text-slate-900 dark:text-white lg:text-h1 flex items-center gap-4">
              Overview
              {isConnected && <Sparkles className="size-8 text-primary-500 animate-pulse" />}
            </h1>
            <p className="max-w-2xl text-body-lg text-slate-600 dark:text-slate-400">
              Monitor your cryptographic credit reputation, active loan requests, and investment portfolio health.
            </p>
          </motion.div>

          {/* Top Stats Overview */}
          <motion.section variants={itemVariants}>
            <div className="grid gap-6 lg:grid-cols-3">
              <CreditScoreCard />
              <LendingActivityCard />
              <BorrowingActivityCard />
            </div>
          </motion.section>

          {/* Activity Layout */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

            {/* Borrowing Section */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <h2 className="text-h4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="size-5 text-primary-500" />
                  My Requests
                </h2>
                <div className="rounded-full bg-primary-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-500">
                  Borrower
                </div>
              </div>
              <div className="rounded-3xl bg-white/50 p-1 dark:bg-white/[0.02]">
                <LoansList
                  borrower={address || undefined}
                  emptyMessage="No active requests found. Create a loan to begin building your history."
                />
              </div>
            </motion.section>

            {/* Lending Section */}
            <motion.section variants={itemVariants} className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
                <h2 className="text-h4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="size-5 text-accent-500" />
                  My Investments
                </h2>
                <div className="rounded-full bg-accent-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-500">
                  Lender
                </div>
              </div>
              <div className="rounded-3xl bg-white/50 p-1 dark:bg-white/[0.02]">
                <LoansList
                  lender={address || undefined}
                  emptyMessage="No yield assets found. Visit the marketplace to fund active requests."
                />
              </div>
            </motion.section>

          </div>

          {/* Footer Ledger Link */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-border/50 bg-surface/50 p-8 text-center backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.02]"
          >
            <HistoryIcon className="mx-auto size-8 text-slate-400 mb-4" />
            <h3 className="text-h4 font-bold text-slate-900 dark:text-white">Transaction Ledger</h3>
            <p className="mt-2 text-small text-slate-500 dark:text-slate-400">
              Review every historical interaction, settlement, and reputation update on the Creditcoin protocol.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-small font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              onClick={() => window.location.href = '/history'}
            >
              View Full History
            </motion.button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
