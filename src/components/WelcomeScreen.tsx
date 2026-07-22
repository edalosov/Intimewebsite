"use client";

import { motion } from "framer-motion";

export function WelcomeScreen() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-4xl italic tracking-tight text-foreground sm:text-5xl"
      >
        Welcome back.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 text-sm font-light tracking-wide text-foreground-muted sm:text-base"
        style={{ color: "var(--foreground-muted)" }}
      >
        Please connect your wallet to continue
      </motion.p>
    </div>
  );
}
