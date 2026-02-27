"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/contexts/WalletContext";

export function ConnectPrompt() {
  const { address, isConnecting, error, hasWallet, connect } = useWallet();

  if (address) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="primary"
        size="lg"
        onClick={connect}
        loading={isConnecting}
        leftIcon={<Wallet className="size-5" />}
      >
        Connect Wallet to Start
      </Button>
      {!hasWallet && (
        <p className="text-small text-gray-500">
          Install MetaMask from{" "}
          <a
            href="https://metamask.io/download"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 underline hover:text-primary-700"
          >
            metamask.io
          </a>
        </p>
      )}
      {error && (
        <div className="flex max-w-sm flex-col items-center gap-2 text-center">
          <p className="text-small text-error" role="alert">
            {error}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => connect()}
            disabled={isConnecting}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
