"use client";

import Link from "next/link";
import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { motion } from "framer-motion";

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Header() {
  const { address, isConnecting, connect, disconnect, error } = useWallet();

  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "border-b border-border/50 dark:border-white/[0.06]",
        "bg-surface/80 dark:bg-[hsl(222,47%,4%)]/80",
        "backdrop-blur-xl supports-[backdrop-filter]:bg-surface/70",
        "transition-colors duration-300"
      )}
    >
      <div className="mx-auto flex h-14 w-full items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 md:px-8">
        {/* Mobile Logo (Visible only on small screens) */}
        <Link
          href="/"
          className="shrink-0 text-h4 font-extrabold tracking-tight text-gray-900 transition-all hover:opacity-80 dark:text-white lg:hidden"
        >
          Cred
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
          >
            Trust
          </span>
        </Link>
        <div className="hidden lg:block lg:flex-1" /> {/* Spacer for desktop */}

        {/* Global Controls */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {address ? (
            <>
              <motion.span
                initial={false}
                className={cn(
                  "flex items-center gap-2 rounded-full",
                  "border border-border/60 dark:border-white/[0.08]",
                  "bg-surface/80 px-3 py-1.5",
                  "text-small font-medium text-gray-700 dark:bg-white/5 dark:text-gray-300",
                  "min-h-[36px] transition-colors"
                )}
                title={address}
              >
                <Wallet className="size-3.5 text-primary-500 dark:text-primary-400" aria-hidden />
                <span className="hidden sm:inline-block">{formatAddress(address)}</span>
              </motion.span>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnect}
                leftIcon={<LogOut className="size-3.5" />}
                aria-label="Disconnect wallet"
                className="rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={connect}
                loading={isConnecting}
                leftIcon={<Wallet className="size-3.5" />}
                className="glow-primary rounded-full px-4 shadow-lg shadow-primary-500/20"
              >
                Connect
              </Button>
              {error && (
                <span
                  title={error}
                  className="block max-w-[160px] truncate rounded-full border border-red-300 bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                >
                  {error}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
