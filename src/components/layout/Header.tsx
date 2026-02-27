"use client";

import Link from "next/link";
import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Header() {
  const { address, isConnecting, connect, disconnect } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/95">
      <div className="mx-auto flex h-14 max-w-container-xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6 md:px-8">
        <Link
          href="/"
          className="shrink-0 text-h4 font-semibold text-gray-900 transition-colors hover:text-primary-600"
        >
          CredTrust
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <Link
            href="/loans"
            className="hidden text-small text-gray-600 hover:text-gray-900 sm:inline-block sm:text-body"
          >
            Browse Loans
          </Link>
          <Link
            href="/dashboard"
            className="hidden text-small text-gray-600 hover:text-gray-900 sm:inline-block sm:text-body"
          >
            Dashboard
          </Link>

          <div className="ml-2 flex shrink-0 items-center gap-2 sm:ml-4">
            {address ? (
              <>
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-small font-medium text-gray-700",
                    "min-h-[44px]"
                  )}
                  title={address}
                >
                  <Wallet className="size-4 text-primary-500" aria-hidden />
                  {formatAddress(address)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnect}
                  leftIcon={<LogOut className="size-4" />}
                  aria-label="Disconnect wallet"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={connect}
                loading={isConnecting}
                leftIcon={<Wallet className="size-4" />}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
