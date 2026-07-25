"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Overlay shell for the intercepted /art/[tokenId] route — only ever
// mounted when navigation happened client-side from within the app (e.g.
// clicking a grid item), never on a direct load/refresh/shared link, which
// renders the full-page route instead. Closing always means "return to
// wherever we came from," so router.back() is safe here.
export function Modal({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") router.back();
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-5">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => router.back()}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="no-scrollbar relative z-10 h-[96dvh] w-full max-w-[1800px] overflow-y-auto border"
        style={{ borderColor: "var(--border-soft)", background: "var(--background)" }}
      >
        {children}
      </motion.div>

      {/* Deliberately a sibling of the animated panel, not a child of it —
          framer-motion drives that panel's entrance via an inline CSS
          transform, and any ancestor with a transform (even at rest)
          creates a new containing block for position: fixed descendants.
          A fixed child of that panel would end up positioned relative to
          the panel instead of the viewport.
          Sits right in the corner with no button chrome — safe now that
          GlobalNav hides the wallet/theme buttons on this route, so
          there's nothing left to collide with here. */}
      <button
        onClick={() => router.back()}
        aria-label="Close"
        className="fixed right-5 top-5 z-[60] text-2xl leading-none transition-colors hover:text-[var(--foreground)]"
        style={{ color: "var(--foreground-muted)" }}
      >
        ×
      </button>
    </div>
  );
}
