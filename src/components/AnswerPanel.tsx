"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { buildAnswerMessage } from "@/lib/answerMessage";

const MAX_LENGTH = 300;

export type AnswerHistoryEntry = {
  id: string;
  answerText: string;
  createdAt: string;
  question: { text: string };
};

export function AnswerPanel({
  tokenId,
  questionId,
  questionText,
  initialHistory,
}: {
  tokenId: string;
  questionId: string | null;
  questionText: string | null;
  initialHistory: AnswerHistoryEntry[];
}) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [answerText, setAnswerText] = useState("");
  const [history, setHistory] = useState(initialHistory);
  const [status, setStatus] = useState<"idle" | "signing" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const alreadyAnswered = history.find((h) => h.question.text === questionText);

  async function handleSubmit() {
    if (!address || !questionText || !questionId) return;
    setError(null);

    try {
      setStatus("signing");
      const timestamp = Date.now();
      const message = buildAnswerMessage({ tokenId, questionText, answerText, timestamp });
      const signature = await signMessageAsync({ message });

      setStatus("submitting");
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          tokenId,
          answerText,
          timestamp,
          signature,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }

      const data = await res.json();
      setHistory((prev) => [data.answer, ...prev.filter((h) => h.id !== data.answer.id)]);
      setAnswerText("");
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="flex h-full flex-col gap-10 px-6 py-10 sm:px-10">
      <section>
        <h2 className="text-xs uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>
          Question of the year
        </h2>

        {questionText ? (
          <>
            <p className="mt-4 font-display text-lg italic leading-relaxed text-foreground">
              {questionText}
            </p>

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value.slice(0, MAX_LENGTH))}
              maxLength={MAX_LENGTH}
              rows={5}
              placeholder={alreadyAnswered ? "Edit your answer…" : "Write your answer…"}
              className="mt-6 w-full resize-none rounded-md border bg-transparent px-4 py-3 text-sm leading-relaxed text-foreground outline-none focus:border-[var(--accent)]"
              style={{ borderColor: "var(--border-soft)" }}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--foreground-faint)" }}>
                {answerText.length}/{MAX_LENGTH}
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!answerText.trim() || status === "signing" || status === "submitting"}
                className="gallery-connect-btn disabled:opacity-40"
              >
                {status === "signing"
                  ? "Confirm in wallet…"
                  : status === "submitting"
                    ? "Submitting…"
                    : "Submit"}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-xs" style={{ color: "#d99c82" }}>
                {error}
              </p>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
            No question has been set yet.
          </p>
        )}
      </section>

      <section className="flex-1 border-t pt-8" style={{ borderColor: "var(--border-soft)" }}>
        <h2 className="text-xs uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>
          Your answers
        </h2>

        {history.length === 0 ? (
          <p className="mt-4 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
            Nothing recorded for this piece yet.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-6">
            {history.map((entry) => (
              <li key={entry.id}>
                <p className="text-xs italic" style={{ color: "var(--foreground-muted)" }}>
                  {entry.question.text}
                </p>
                <p className="mt-1 text-sm font-light leading-relaxed text-foreground">
                  {entry.answerText}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--foreground-faint)" }}>
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
