"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CHAINS = [
  { id: 11155111, label: "Sepolia (testnet)" },
  { id: 1, label: "Ethereum mainnet" },
];

export function AdminForm({
  initialContractAddress,
  initialChainId,
}: {
  initialContractAddress: string;
  initialChainId: number;
}) {
  const router = useRouter();
  const [contractAddress, setContractAddress] = useState(initialContractAddress);
  const [chainId, setChainId] = useState(initialChainId);
  const [status, setStatus] = useState<string | null>(null);

  async function saveConfig() {
    setStatus("Saving contract settings…");
    const res = await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nftContractAddress: contractAddress, chainId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error || "Failed to save contract settings");
      return;
    }
    setStatus("Contract settings saved.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="mt-10 flex flex-col gap-14">
      <section className="flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>
          Collection contract
        </h2>
        <input
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x…"
          className="rounded-md border bg-transparent px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-[var(--accent)]"
          style={{ borderColor: "var(--border-soft)" }}
        />
        <div className="flex gap-3">
          {CHAINS.map((chain) => (
            <button
              key={chain.id}
              type="button"
              onClick={() => setChainId(chain.id)}
              className="gallery-connect-btn"
              style={
                chainId === chain.id
                  ? { borderColor: "var(--accent)", color: "var(--accent)" }
                  : undefined
              }
            >
              {chain.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={saveConfig} className="gallery-connect-btn self-start">
          Save contract
        </button>
      </section>

      {status && (
        <p className="text-sm" style={{ color: "var(--accent)" }}>
          {status}
        </p>
      )}

      <button type="button" onClick={logout} className="self-start text-xs underline" style={{ color: "var(--foreground-faint)" }}>
        Log out
      </button>
    </div>
  );
}
