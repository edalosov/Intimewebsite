"use client";

import { useParams, useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { ArtworkDetail } from "@/components/ArtworkDetail";

export default function ArtDetailModal() {
  const params = useParams<{ tokenId: string }>();
  const router = useRouter();
  return (
    <Modal>
      <ArtworkDetail
        tokenId={params.tokenId}
        className="flex h-full flex-col lg:flex-row"
        onBack={() => router.back()}
      />
    </Modal>
  );
}
