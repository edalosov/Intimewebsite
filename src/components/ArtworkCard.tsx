"use client";

import Link from "next/link";
import Image from "next/image";
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
          className="aspect-square w-full overflow-hidden rounded-md border"
          style={{ borderColor: "var(--border-soft)", background: "var(--background-elevated)" }}
        >
          {token.image ? (
            <Image
              src={token.image}
              alt={token.name}
              width={640}
              height={640}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs" style={{ color: "var(--foreground-faint)" }}>
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
