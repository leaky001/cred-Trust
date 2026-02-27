"use client";

import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/config";
import { LOAN_FACTORY_ABI } from "@/lib/contracts/abis";
import { Contract } from "ethers";

export default function DebugContractsPage() {
  const { signer, address } = useWallet();
  const [loans, setLoans] = useState<string[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchLoans = async () => {
    setErr(null);
    if (!signer) {
      setErr("No signer: connect your wallet first");
      return;
    }
    if (!CONTRACT_ADDRESSES.loanFactory) {
      setErr("No NEXT_PUBLIC_LOAN_FACTORY_ADDRESS set in env");
      return;
    }
    try {
      const factory = new Contract(CONTRACT_ADDRESSES.loanFactory, LOAN_FACTORY_ABI, signer);
      const list = await factory.listLoans();
      setLoans(list.map((a: any) => String(a)));
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-h2 font-bold">Contracts Debug</h1>
      <p className="mt-2 text-body text-gray-600">Frontend contract addresses (baked at build time):</p>
      <pre className="mt-4 rounded bg-gray-50 p-4 text-small">{JSON.stringify(CONTRACT_ADDRESSES, null, 2)}</pre>
      <p className="mt-4 text-small">Connected wallet: {address ?? "not connected"}</p>

      <div className="mt-6">
        <button className="px-4 py-2 rounded bg-primary-600 text-white" onClick={fetchLoans}>
          Fetch loans from chain
        </button>
      </div>

      {err && <p className="mt-4 text-red-500">Error: {err}</p>}

      {loans && (
        <div className="mt-4">
          <h3 className="text-h4">Loans on chain:</h3>
          <ul className="mt-2 list-disc pl-6">
            {loans.map((l) => (
              <li key={l} className="text-small text-gray-700">{l}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
