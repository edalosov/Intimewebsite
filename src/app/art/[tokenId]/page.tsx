"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { AnswerPanel, type AnswerHistoryEntry } from "@/components/AnswerPanel";
import type { OwnedToken } from "@/lib/alchemy";

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      token: OwnedToken;
      question: { id: string; text: string } | null;
      history: AnswerHistoryEntry[];
    };

export default function ArtDetailPage() {
  const params = useParams<{ tokenId: string }>();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [state, setState] = useState<DetailState>({ status: "loading" });

  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
      return;
    }
    if (!address) return;

    let cancelled = false;
    // Reset to loading whenever the token or wallet changes, before the fetch below resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading" });

    fetch(`/api/art/${params.tokenId}?address=${address}`)
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
  }, [params.tokenId, address, isConnected, router]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          {state.message}
        </p>
        <Link href="/" className="gallery-connect-btn">
          Back to collection
        </Link>
      </div>
    );
  }

  const { token, question, history } = state;

  return (
    <div className="flex min-h-[100dvh] flex-col lg:flex-row">
      <div className="flex w-full items-center justify-center bg-[var(--background-elevated)] p-6 pt-24 lg:w-2/3 lg:p-16">
        {token.image ? (
          <Image
            src={token.image}
            alt={token.name}
            width={1200}
            height={1200}
            unoptimized
            className="max-h-[80vh] w-auto max-w-full rounded-sm object-contain"
          />
        ) : (
          <div className="text-sm" style={{ color: "var(--foreground-faint)" }}>
            No image
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
          initialHistory={history}
        />
      </div>
    </div>
  );
}
