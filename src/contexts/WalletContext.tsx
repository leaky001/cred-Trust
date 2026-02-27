"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { BrowserProvider, type JsonRpcSigner } from "ethers";

type WalletState = {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
};

type WalletContextValue = WalletState & {
  connect: () => Promise<void>;
  disconnect: () => void;
  signer: JsonRpcSigner | null;
  hasWallet: boolean;
};

const WalletContext = createContext<WalletContextValue | null>(null);

function getEthereumProvider(): unknown {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    ethereum?: unknown & { providers?: unknown[]; isMetaMask?: boolean };
  };
  const eth = w.ethereum;
  if (!eth) return null;
  // Multiple wallets: pick MetaMask or first available
  if (Array.isArray((eth as { providers?: any[] }).providers)) {
    const providers = (eth as { providers: any[] }).providers;
    const mm = providers.find((p: any) => p?.isMetaMask);
    return mm ?? providers[0] ?? eth;
  }
  return eth;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    setHasWallet(!!getEthereumProvider());
  }, []);

  const connect = useCallback(async () => {
    const ethereum = getEthereumProvider();
    if (!ethereum) {
      setError("No wallet found. Install MetaMask from metamask.io");
      return;
    }

    setIsConnecting(true);
    setError(null);

    const attempt = async (): Promise<void> => {
      const provider = ethereum as { request: (args: { method: string }) => Promise<unknown> };
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[] | undefined;

      if (!accounts?.[0]) {
        setError("No accounts returned. Unlock MetaMask and try again.");
        return;
      }

      const browserProvider = new BrowserProvider(ethereum as import("ethers").Eip1193Provider);
      const signerInstance = await browserProvider.getSigner();

      setAddress(accounts[0]);
      setSigner(signerInstance);
    };

    try {
      await attempt();
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const isRejected = raw.includes("reject") || raw.includes("denied") || raw.includes("User denied");
      const isExtNotFound =
        raw.includes("MetaMask extension not found") ||
        raw.includes("extension not found");

      if (isRejected) {
        setError("Connection cancelled. Click Connect again when ready.");
      } else if (isExtNotFound) {
        // MetaMask's background script may not be ready — retry after a short delay
        await new Promise((r) => setTimeout(r, 1500));
        try {
          await attempt();
        } catch (retryErr) {
          setError(
            "MetaMask couldn't connect. Try: 1) Refresh the page 2) Unlock MetaMask 3) Restart Chrome 4) Click Connect again"
          );
          setAddress(null);
          setSigner(null);
        }
      } else {
        setError(
          isExtNotFound
            ? "MetaMask couldn't connect. Refresh the page, unlock MetaMask, then try again."
            : raw
        );
        setAddress(null);
        setSigner(null);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setError(null);
  }, []);

  useEffect(() => {
    const ethereum = getEthereumProvider() as { on?: (event: string, cb: (args: unknown) => void) => void } | null;
    if (!ethereum?.on) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const list = accounts as string[];
      if (list.length === 0) disconnect();
      else setAddress(list[0]);
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      (ethereum as { removeListener?: (e: string, cb: (args: unknown) => void) => void }).removeListener?.("accountsChanged", handleAccountsChanged);
      (ethereum as { removeListener?: (e: string, cb: () => void) => void }).removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  const value: WalletContextValue = {
    address,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect,
    signer,
    hasWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
