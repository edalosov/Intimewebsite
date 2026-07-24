"use client";

import { useParams } from "next/navigation";
import { Modal } from "@/components/Modal";
import { ArtworkDetail } from "@/components/ArtworkDetail";

export default function ArtDetailModal() {
  const params = useParams<{ tokenId: string }>();
  return (
    <Modal>
      <ArtworkDetail tokenId={params.tokenId} className="flex h-full flex-col lg:flex-row lg:items-start" />
    </Modal>
  );
}
