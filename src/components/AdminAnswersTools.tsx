"use client";

import { useState } from "react";

export function AdminAnswersTools() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleReset() {
    setBusy(true);
    setStatus(null);

    const res = await fetch("/api/admin/answers/reset", { method: "POST" });
    setBusy(false);
    setConfirming(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus(data.error || "Failed to clear answers");
      return;
    }

    const data = await res.json();
    setStatus(`Cleared ${data.count} answer${data.count === 1 ? "" : "s"}.`);
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm uppercase tracking-widest" style={{ color: "var(--foreground-muted)" }}>
        Answers data
      </h2>

      <a href="/api/admin/answers/export" className="gallery-connect-btn self-start">
        Download answers (.xlsx)
      </a>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="self-start text-xs underline"
          style={{ color: "#d99c82" }}
        >
          Clear all answers…
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs" style={{ color: "#d99c82" }}>
            This permanently deletes every submitted answer. Are you sure?
          </span>
          <button type="button" onClick={handleReset} disabled={busy} className="gallery-connect-btn disabled:opacity-40">
            {busy ? "Clearing…" : "Yes, clear all"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-xs underline"
            style={{ color: "var(--foreground-faint)" }}
          >
            Cancel
          </button>
        </div>
      )}

      {status && (
        <p className="text-sm" style={{ color: "var(--accent)" }}>
          {status}
        </p>
      )}
    </section>
  );
}
