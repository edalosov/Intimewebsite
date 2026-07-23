"use client";

import { useParams } from "next/navigation";
import { ArtworkDetail } from "@/components/ArtworkDetail";

export default function ArtDetailPage() {
  const params = useParams<{ tokenId: string }>();
  return <ArtworkDetail tokenId={params.tokenId} />;
}
