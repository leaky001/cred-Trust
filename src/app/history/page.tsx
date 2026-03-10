"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History as HistoryIcon, Activity, Database, CheckCircle2, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useLoans } from "@/hooks/useLoans";
import { formatEther } from "ethers";
import type { Loan } from "@/types/loan";

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function HistoryPage() {
  const { fetchLoans, isConfigured } = useLoans();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    fetchLoans()
      .then((data) => {
        // Reverse so newest are first
        setLoans(data.reverse());
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchLoans, isConfigured]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Requested": return <Clock className="size-4 text-amber-500" />;
      case "Active": return <Activity className="size-4 text-primary-500" />;
      case "Repaid": return <CheckCircle2 className="size-4 text-emerald-500" />;
      case "Defaulted": return <AlertTriangle className="size-4 text-rose-500" />;
      default: return <Database className="size-4 text-slate-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Requested": return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50";
      case "Active": return "bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/50";
      case "Repaid": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50";
      case "Defaulted": return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50";
      default: return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
    }
  };

  return (
    <div className="relative isolate min-h-screen pb-24">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 size-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-container-xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-12"
        >
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/50 dark:border-slate-800/50 bg-slate-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <HistoryIcon className="size-3.5" />
              Public Ledger
            </div>
            <h1 className="text-h2 font-bold tracking-tight text-slate-900 dark:text-white lg:text-h1">
              Global Transaction History
            </h1>
            <p className="max-w-2xl text-body-lg text-slate-600 dark:text-slate-400">
              A transparent, immutable record of all loan creations, fundings, and settlements on the protocol.
            </p>
          </div>

          <Card className="glass-card shadow-xl border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/50 pb-6">
              <CardTitle className="text-h4 flex items-center gap-2">
                <Database className="size-5 text-primary-500" />
                Immutable Ledger Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  <Activity className="size-8 animate-pulse mx-auto mb-4 text-primary-400" />
                  Syncing on-chain history...
                </div>
              ) : !isConfigured || loans.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  No transaction history found on the network.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Contract ID</th>
                        <th className="px-6 py-4">Borrower</th>
                        <th className="px-6 py-4">Lender(s)</th>
                        <th className="px-6 py-4 text-right">Principal</th>
                        <th className="px-6 py-4 text-right">Yield</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {loans.map((loan) => (
                        <tr key={loan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">
                            {formatAddress(loan.id)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-slate-900 dark:text-slate-200">
                              {formatAddress(loan.borrower)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {loan.lendersCount > 1 ? (
                              <span className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium">
                                <ShieldCheck className="size-4" />
                                Multiple ({loan.lendersCount})
                              </span>
                            ) : loan.lender ? (
                              <span className="font-mono text-slate-600 dark:text-slate-400">
                                {formatAddress(loan.lender)}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                            {formatEther(loan.principal)} CTC
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-500">
                            {loan.interestRate}% APR
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(loan.status)}`}>
                              {getStatusIcon(loan.status)}
                              {loan.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
