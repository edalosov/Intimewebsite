"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Shared soft entrance used site-wide (including admin, which otherwise
// renders instantly with no transition) so nothing pops in harshly.
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
