"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { buildAnswerMessage } from "@/lib/answerMessage";

const MAX_LENGTH = 300;

export type YearEntry = {
  yearNumber: number;
  questionId: string;
  questionText: string;
  startsAt: string;
  endsAt: string;
  status: "past" | "current" | "future";
  answer: { id: string; answerText: string; createdAt: string } | null;
};

function defaultYear(years: YearEntry[]): number {
  const current = years.find((y) => y.status === "current");
  if (current) return current.yearNumber;
  const past = years.filter((y) => y.status === "past");
  if (past.length > 0) return past[past.length - 1].yearNumber;
  return years[0]?.yearNumber ?? 1;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export function AnswerPanel({ tokenId, years }: { tokenId: string; years: YearEntry[] }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [localYears, setLocalYears] = useState(years);
  const [selectedYear, setSelectedYear] = useState(() => defaultYear(years));
  const [answerText, setAnswerText] = useState("");
  const [status, setStatus] = useState<"idle" | "signing" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const current = localYears.find((y) => y.yearNumber === selectedYear) ?? null;

  function selectYear(year: YearEntry) {
    if (year.status === "future") return;
    setSelectedYear(year.yearNumber);
    setAnswerText("");
    setError(null);
    setStatus("idle");
  }

  async function handleSubmit() {
    if (!address || !current || current.status !== "current" || current.answer) return;
    const questionText = current.questionText;
    setError(null);

    try {
      setStatus("signing");
      // handleSubmit only ever runs from the Submit button's onClick, never
      // during render — Date.now() here is a real submission timestamp, not
      // a render-time impurity.
      // eslint-disable-next-line react-hooks/purity
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
      setLocalYears((prev) =>
        prev.map((y) =>
          y.yearNumber === selectedYear
            ? { ...y, answer: { id: data.answer.id, answerText: data.answer.answerText, createdAt: data.answer.createdAt } }
            : y,
        ),
      );
      setAnswerText("");
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="flex h-full flex-col gap-8 px-6 py-10 sm:px-10">
      {localYears.length === 0 ? (
        <p className="text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          No question has been set yet.
        </p>
      ) : (
        <>
          <nav className="flex flex-wrap gap-3">
            {localYears.map((year) => {
              const isSelected = year.yearNumber === selectedYear;
              const isDisabled = year.status === "future";
              return (
                <button
                  key={year.yearNumber}
                  type="button"
                  onClick={() => selectYear(year)}
                  disabled={isDisabled}
                  aria-current={isSelected}
                  className="text-sm underline-offset-4 disabled:cursor-not-allowed disabled:no-underline"
                  style={{
                    color: isDisabled ? "var(--foreground-faint)" : isSelected ? "var(--foreground)" : "var(--foreground-muted)",
                    opacity: isDisabled ? 0.4 : 1,
                    textDecoration: isSelected ? "underline" : "none",
                    fontWeight: isSelected ? 700 : 400,
                  }}
                >
                  {year.yearNumber}
                </button>
              );
            })}
          </nav>

          {current && (
            <section>
              <h2 className="text-xs uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>
                Year {current.yearNumber}
              </h2>

              <p className="mt-4 font-display-italic-alt text-lg italic leading-relaxed text-foreground">
                {current.questionText}
              </p>

              {current.answer ? (
                <>
                  <p className="mt-6 text-sm font-light leading-relaxed text-foreground">
                    {current.answer.answerText}
                  </p>
                  <p className="mt-2 text-xs" style={{ color: "var(--foreground-faint)" }}>
                    Submitted {new Date(current.answer.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-6 text-xs italic" style={{ color: "var(--foreground-muted)" }}>
                    You&apos;ve already submitted an answer for this year&apos;s question. Thank you for that!
                  </p>
                </>
              ) : current.status === "current" ? (
                <>
                  <p className="mt-2 text-xs" style={{ color: "var(--foreground-faint)" }}>
                    Answer by {formatDate(current.endsAt)}
                  </p>

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
                <p className="mt-6 text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
                  No answer was submitted for this year.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
