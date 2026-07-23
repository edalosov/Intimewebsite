"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { OwnedToken } from "@/lib/alchemy";

export function ArtworkCard({ token, index }: { token: OwnedToken; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/art/${token.tokenId}`} className="group block">
        <div
          className="w-full overflow-hidden rounded-md border"
          style={{ borderColor: "var(--border-soft)", background: "var(--background-elevated)" }}
        >
          {token.image ? (
            // Plain <img>, not next/image: these come from arbitrary
            // external hosts with unknown dimensions, and we want each
            // piece to keep its real aspect ratio instead of being
            // cropped into a fixed box.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={token.image}
              alt={token.name}
              loading="lazy"
              className="block w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="flex aspect-[4/5] w-full items-center justify-center text-xs"
              style={{ color: "var(--foreground-faint)" }}
            >
              No image
            </div>
          )}
        </div>
        <p
          className="mt-3 text-center text-sm font-light tracking-wide"
          style={{ color: "var(--foreground-muted)" }}
        >
          {token.name}
        </p>
      </Link>
    </motion.div>
  );
}
