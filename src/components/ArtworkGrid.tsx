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

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const },
};

export function ArtworkGrid() {
  const [state, setState] = useState<GalleryState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/gallery")
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
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 sm:px-10 sm:pt-40">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="font-display-italic-alt italic text-3xl text-foreground sm:text-4xl"
      >
        Unfinished Past
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 text-base tracking-wide text-foreground sm:text-lg"
      >
        Click individually to answer
      </motion.p>

      {state.status === "loading" && (
        <motion.p {...fadeIn} className="mt-10 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          Gathering your pieces…
        </motion.p>
      )}

      {state.status === "not-configured" && (
        <motion.p {...fadeIn} className="mt-10 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          The gallery hasn&apos;t been configured with a collection yet. Check back soon.
        </motion.p>
      )}

      {state.status === "error" && (
        <motion.p {...fadeIn} className="mt-10 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          Something went wrong loading your collection. Please try again shortly.
        </motion.p>
      )}

      {state.status === "empty" && (
        <motion.p {...fadeIn} className="mt-10 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          This wallet doesn&apos;t hold any pieces from the collection yet.
        </motion.p>
      )}

      {state.status === "ready" && (
        <div className="mt-12 grid grid-cols-2 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {state.tokens.map((token, i) => (
            <ArtworkCard key={token.tokenId} token={token} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
