"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { buildAnswerMessage } from "@/lib/answerMessage";

const MAX_LENGTH = 300;

// The panel is a narrower stacked column on mobile (less vertical room
// once the image above it is accounted for) and a taller side rail on
// desktop, so how many answers comfortably fit before scrolling differs.
const PAGE_SIZE_MOBILE = 3;
const PAGE_SIZE_DESKTOP = 5;

function useAnswersPageSize() {
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DESKTOP);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setPageSize(query.matches ? PAGE_SIZE_DESKTOP : PAGE_SIZE_MOBILE);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return pageSize;
}

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
  questionEndsAt,
  questionYearNumber,
  initialHistory,
}: {
  tokenId: string;
  questionId: string | null;
  questionText: string | null;
  questionEndsAt: string | null;
  questionYearNumber: number | null;
  initialHistory: AnswerHistoryEntry[];
}) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [answerText, setAnswerText] = useState("");
  const [history, setHistory] = useState(initialHistory);
  const [status, setStatus] = useState<"idle" | "signing" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const pageSize = useAnswersPageSize();
  const totalPages = Math.max(1, Math.ceil(history.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pagedHistory = history.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

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
      setHistory((prev) => [data.answer, ...prev]);
      setPage(0);
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
          {questionYearNumber ? `Year ${questionYearNumber}` : "Question of the year"}
        </h2>

        {questionText ? (
          <>
            <p className="mt-4 font-display-italic-alt text-lg italic leading-relaxed text-foreground">
              {questionText}
            </p>
            {questionEndsAt && (
              <p className="mt-2 text-xs" style={{ color: "var(--foreground-faint)" }}>
                Answer by {new Date(questionEndsAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value.slice(0, MAX_LENGTH))}
              maxLength={MAX_LENGTH}
              rows={5}
              placeholder="Write your answer…"
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
          <>
            <ul className="mt-4 flex flex-col gap-6">
              {pagedHistory.map((entry) => (
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

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between text-xs" style={{ color: "var(--foreground-faint)" }}>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="underline disabled:no-underline disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span>
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="underline disabled:no-underline disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
