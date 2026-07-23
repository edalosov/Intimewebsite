"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { AnswerPanel, type AnswerHistoryEntry } from "@/components/AnswerPanel";
import { VerifyWalletPrompt } from "@/components/VerifyWalletPrompt";
import { useWalletVerification } from "@/hooks/useWalletVerification";
import { useFallbackImage } from "@/hooks/useFallbackImage";
import type { OwnedToken } from "@/lib/alchemy";

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      token: OwnedToken;
      question: { id: string; text: string; startsAt: string; endsAt: string } | null;
      history: AnswerHistoryEntry[];
    };

// Shared between the full-page route (app/art/[tokenId]/page.tsx, used on
// direct navigation/refresh/shared links) and the intercepted modal route
// (app/@modal/(.)art/[tokenId]/page.tsx, used when opened from the grid) —
// `className` lets each wrapper control sizing without duplicating the
// fetch/loading/error logic.
export function ArtworkDetail({
  tokenId,
  className = "flex min-h-[100dvh] flex-col lg:flex-row",
}: {
  tokenId: string;
  className?: string;
}) {
  const router = useRouter();
  const { isConnected, status: accountStatus } = useAccount();
  const { status: verification, error: verifyError, verify } = useWalletVerification();
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const imageCandidates = state.status === "ready" ? state.token.images : [];
  const { src: imageSrc, failed: imageFailed, loaded: imageLoaded, onLoad: onImageLoad, onError: onImageError } =
    useFallbackImage(imageCandidates, tokenId);
  const reportedImageFailure = useRef(false);

  useEffect(() => {
    if (!imageFailed || reportedImageFailure.current) return;
    reportedImageFailure.current = true;
    fetch(`/api/art/${tokenId}/refresh-image`, { method: "POST" }).catch(() => {});
  }, [imageFailed, tokenId]);

  useEffect(() => {
    // On a fresh page load (direct link, refresh), wagmi's wallet reconnect
    // is asynchronous, and accountStatus can read "disconnected" for a
    // moment before settling into "reconnecting"/"connected" — even with
    // ssr: true on the wagmi config. Give it a beat before treating
    // "disconnected" as final and bouncing to the grid.
    if (accountStatus !== "disconnected") return;
    const timeout = setTimeout(() => router.replace("/"), 1000);
    return () => clearTimeout(timeout);
  }, [accountStatus, router]);

  useEffect(() => {
    if (verification !== "verified") return;

    let cancelled = false;
    // Reset to loading whenever the token changes, before the fetch below resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });
    reportedImageFailure.current = false;

    fetch(`/api/art/${tokenId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load artwork");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setState({ status: "ready", token: data.token, question: data.question, history: data.history });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: "error", message: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [tokenId, verification]);

  if (!isConnected) {
    return null;
  }

  if (verification !== "verified") {
    return <VerifyWalletPrompt status={verification} error={verifyError} onVerify={verify} />;
  }

  if (state.status === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-full w-full items-center justify-center"
      >
        <p className="text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          Loading…
        </p>
      </motion.div>
    );
  }

  if (state.status === "error") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-full w-full flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <p className="text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          {state.message}
        </p>
        <Link href="/" className="gallery-connect-btn">
          Back to collection
        </Link>
      </motion.div>
    );
  }

  const { token, question, history } = state;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <div className="flex w-full items-center justify-center bg-[var(--background-elevated)] p-6 pt-24 lg:w-2/3 lg:p-16">
        {imageSrc ? (
          <Image
            key={imageSrc}
            src={imageSrc}
            alt={token.name}
            width={1200}
            height={1200}
            unoptimized
            onLoad={onImageLoad}
            onError={onImageError}
            style={{ opacity: imageLoaded ? 1 : 0 }}
            className="max-h-[80vh] w-auto max-w-full rounded-sm object-contain transition-opacity duration-[1100ms] ease-out"
          />
        ) : (
          <div className="text-sm" style={{ color: "var(--foreground-faint)" }}>
            {imageFailed ? "Image unavailable" : "No image"}
          </div>
        )}
      </div>

      <div className="w-full border-t lg:w-1/3 lg:border-l lg:border-t-0" style={{ borderColor: "var(--border-soft)" }}>
        <div className="px-6 pt-24 sm:px-10 lg:pt-16">
          <Link href="/" className="text-xs underline" style={{ color: "var(--foreground-faint)" }}>
            ← Back to collection
          </Link>
          <h1 className="mt-4 font-display text-2xl italic text-foreground">{token.name}</h1>
        </div>

        <AnswerPanel
          tokenId={token.tokenId}
          questionId={question?.id ?? null}
          questionText={question?.text ?? null}
          questionEndsAt={question?.endsAt ?? null}
          initialHistory={history}
        />
      </div>
    </motion.div>
  );
}
