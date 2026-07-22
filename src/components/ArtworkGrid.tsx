"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArtworkCard } from "@/components/ArtworkCard";
import type { OwnedToken } from "@/lib/alchemy";

type GalleryState =
  | { status: "loading" }
  | { status: "not-configured" }
  | { status: "empty" }
  | { status: "ready"; tokens: OwnedToken[] }
  | { status: "error"; message: string };

export function ArtworkGrid({ address }: { address: string }) {
  const [state, setState] = useState<GalleryState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    // Reset to loading whenever the wallet address changes, before the fetch below resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });

    fetch(`/api/gallery?address=${address}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load gallery");
        return res.json() as Promise<{ configured: boolean; tokens: OwnedToken[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        if (!data.configured) {
          setState({ status: "not-configured" });
        } else if (data.tokens.length === 0) {
          setState({ status: "empty" });
        } else {
          setState({ status: "ready", tokens: data.tokens });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", message: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 sm:px-10 sm:pt-40">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="font-display text-2xl italic text-foreground sm:text-3xl"
      >
        Your collection
      </motion.h2>

      {state.status === "loading" && (
        <p className="mt-10 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          Gathering your pieces…
        </p>
      )}

      {state.status === "not-configured" && (
        <p className="mt-10 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          The gallery hasn&apos;t been configured with a collection yet. Check back soon.
        </p>
      )}

      {state.status === "error" && (
        <p className="mt-10 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          Something went wrong loading your collection. Please try again shortly.
        </p>
      )}

      {state.status === "empty" && (
        <p className="mt-10 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          This wallet doesn&apos;t hold any pieces from the collection yet.
        </p>
      )}

      {state.status === "ready" && (
        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-14 sm:grid-cols-3 lg:grid-cols-4">
          {state.tokens.map((token, i) => (
            <ArtworkCard key={token.tokenId} token={token} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
