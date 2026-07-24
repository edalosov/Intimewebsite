"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useFallbackImage } from "@/hooks/useFallbackImage";
import type { OwnedToken } from "@/lib/alchemy";

export function ArtworkCard({ token, index }: { token: OwnedToken; index: number }) {
  const { src, failed, loaded, onLoad, onError } = useFallbackImage(token.images, token.tokenId);
  const reported = useRef(false);

  useEffect(() => {
    if (!failed || reported.current) return;
    reported.current = true;
    fetch(`/api/art/${token.tokenId}/refresh-image`, { method: "POST" }).catch(() => {});
  }, [failed, token.tokenId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.1 * index, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/art/${token.tokenId}`} className="group block">
        <div
          className="w-full overflow-hidden border"
          style={{ borderColor: "var(--border-soft)", background: "var(--background-elevated)" }}
        >
          {src ? (
            // Plain <img>, not next/image: these come from arbitrary
            // external hosts with unknown dimensions, and we want each
            // piece to keep its real aspect ratio instead of being
            // cropped into a fixed box.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={token.name}
              loading="lazy"
              onLoad={onLoad}
              onError={onError}
              style={{ opacity: loaded ? 1 : 0 }}
              className="block w-full transition-opacity duration-[1100ms] ease-out"
            />
          ) : (
            <div
              className="flex aspect-[4/5] w-full items-center justify-center text-xs"
              style={{ color: "var(--foreground-faint)" }}
            >
              {failed ? "Image unavailable" : "No image"}
            </div>
          )}
        </div>
        <p
          className="mt-3 text-center text-sm font-light tracking-wide group-hover:underline"
          style={{ color: "var(--foreground-muted)" }}
        >
          {token.name}
        </p>
      </Link>
    </motion.div>
  );
}
