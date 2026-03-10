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
  switchNetwork: (chainId: string) => Promise<void>;
  signer: JsonRpcSigner | null;
  hasWallet: boolean;
};

const WalletContext = createContext<WalletContextValue | null>(null);

// Note: we intentionally create a safe provider accessor inside the
// WalletProvider so it can be referenced from hooks and included in
// dependency arrays without triggering the React hooks linter.

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasWallet, setHasWallet] = useState(false);
  const [ethereum, setEthereum] = useState<any | null>(null);

  // Safer window.ethereum proxy to avoid conflicts. Put inside the
  // component and wrap with useCallback so it can be referenced from
  // effects/callbacks and included in dependency arrays.
  const getEthereumProvider = useCallback((): any => {
    if (typeof window === "undefined") return null;
    try {
      const w = window as any;
      const eth = w.ethereum;
      if (!eth) return null;

      // If multiple wallets are injected (e.g. MetaMask + Coinbase)
      if (eth.providers?.length) {
        const mm = eth.providers.find((p: any) => p?.isMetaMask);
        return mm || eth.providers[0];
      }

      return eth;
    } catch (err) {
      // Some browser extensions may throw while trying to redefine or access
      // `window.ethereum` (we've seen 'Cannot redefine property: ethereum').
      // In that case, avoid crashing the app and report that no provider
      // is currently available — callers will retry or surface a friendly
      // error to the user.
      // eslint-disable-next-line no-console
      console.warn('Error accessing window.ethereum, will treat as no provider for now:', err);
      return null;
    }
  }, []);

  // Poll for an injected provider for a short window to avoid races with
  // extensions that inject asynchronously. This prevents the app from
  // showing a hard "no wallet" state while MetaMask is still initializing.
  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    const maxAttempts = 8;
    const delayMs = 500;

    const check = () => {
      attempts += 1;
      try {
        const eth = getEthereumProvider();
        if (eth) {
          if (!mounted) return;
          setEthereum(eth);
          setHasWallet(true);
          return;
        }
      } catch (e) {
        // ignored — getEthereumProvider already logs warnings
      }

      if (attempts < maxAttempts && mounted) {
        setTimeout(check, delayMs);
      } else if (mounted) {
        setHasWallet(false);
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, [getEthereumProvider]);

  // Auto-reconnect: silently restore previously connected wallet on page load.
  // Uses eth_accounts (no popup) — only succeeds if user already approved the site.
  useEffect(() => {
    if (!ethereum) return;
    let cancelled = false;
    (async () => {
      try {
        const accounts = (await ethereum.request({ method: "eth_accounts" })) as string[];
        if (cancelled || !accounts?.[0]) return;
        const browserProvider = new BrowserProvider(ethereum);
        const signerInstance = await browserProvider.getSigner();
        setAddress(accounts[0]);
        setSigner(signerInstance);
      } catch {
        // Silent — user simply isn't connected yet
      }
    })();
    return () => { cancelled = true; };
  }, [ethereum]);



  const connect = useCallback(async () => {
    const ethereum = getEthereumProvider();
    if (!ethereum) {
      setError("No wallet found. Install MetaMask from metamask.io");
      return;
    }

    setIsConnecting(true);
    setError(null);

    const attempt = async (): Promise<void> => {
      try {
        const accounts = (await ethereum.request({
          method: "eth_requestAccounts",
        })) as string[] | undefined;

        if (!accounts?.[0]) {
          setError("No accounts returned. Unlock MetaMask and try again.");
          return;
        }

        const browserProvider = new BrowserProvider(ethereum);
        const signerInstance = await browserProvider.getSigner();

        setAddress(accounts[0]);
        setSigner(signerInstance);
      } catch (err: any) {
        // Handle "Request already pending" or other internal errors
        if (err.code === -32002) {
          setError("Connection request already pending in MetaMask. Please check your extension.");
        } else if (err.code === -32603 || (err.message && String(err.message).includes('Internal JSON-RPC error'))) {
          // MetaMask sometimes surfaces -32603 when the wallet backend (or local node)
          // returns an internal error. Surface a friendly hint to the user.
          setError("Wallet RPC error: Internal JSON-RPC error. Ensure your node (e.g. Hardhat) is running and MetaMask is connected to the correct network.");
        } else {
          throw err;
        }
      }
    };

    try {
      await attempt();
    } catch (err: any) {
      const raw = err.message || String(err);
      const isRejected = raw.includes("reject") || raw.includes("denied") || raw.includes("User denied");

      if (isRejected) {
        setError("Connection cancelled. Click Connect again when ready.");
      } else {
        setError(raw);
        setAddress(null);
        setSigner(null);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [getEthereumProvider]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setError(null);
  }, []);

  useEffect(() => {
    const eth = ethereum || getEthereumProvider();
    if (!eth?.on) return;

    const handleAccountsChanged = (accounts: any) => {
      if (!accounts || accounts.length === 0) disconnect();
      else setAddress(accounts[0]);
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnect, ethereum, getEthereumProvider]);

  const switchNetwork = useCallback(async (chainId: string) => {
    const ethereum = getEthereumProvider();
    if (!ethereum) throw new Error("No wallet found");

    const hexChainId = `0x${Number(chainId).toString(16)}`;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError: any) {
      // Error 4902 means the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexChainId,
                chainName: chainId === "31337" ? "Hardhat Local" : "Creditcoin Testnet",
                rpcUrls: chainId === "31337" ? ["http://127.0.0.1:8545"] : ["https://rpc.cc3-testnet.creditcoin.network"],
                nativeCurrency: { name: "Creditcoin", symbol: "CTC", decimals: 18 },
              },
            ],
          });
        } catch (addError) {
          throw new Error("Failed to add network to wallet");
        }
      } else {
        throw new Error(switchError.message || "Failed to switch network");
      }
    }
  }, [getEthereumProvider]);

  const value: WalletContextValue = {
    address,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
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
