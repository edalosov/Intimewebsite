"use client";

import type { VerificationStatus } from "@/hooks/useWalletVerification";

export function VerifyWalletPrompt({
  status,
  error,
  onVerify,
}: {
  status: VerificationStatus;
  error: string | null;
  onVerify: () => void;
}) {
  const isChecking = status === "checking" || status === "idle";

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      {isChecking ? (
        <p className="text-sm font-light" style={{ color: "var(--foreground-faint)" }}>
          Checking your wallet…
        </p>
      ) : (
        <>
          <p className="font-display text-xl italic text-foreground">Sign to continue</p>
          <p className="max-w-xs text-sm font-light" style={{ color: "var(--foreground-muted)" }}>
            A free signature — no gas, no transaction — proves this is your wallet before we show
            your collection.
          </p>
          {error && (
            <p className="text-xs" style={{ color: "#d99c82" }}>
              {error}
            </p>
          )}
          <button onClick={onVerify} disabled={status === "signing"} className="gallery-connect-btn mt-2 disabled:opacity-40">
            {status === "signing" ? "Confirm in wallet…" : "Sign to continue"}
          </button>
        </>
      )}
    </div>
  );
}
