import { NextRequest, NextResponse } from "next/server";
import { getGalleryConfig } from "@/lib/config";
import { refreshTokenMetadata } from "@/lib/alchemy";
import { getWalletSession } from "@/lib/walletSession";

// Called when every candidate image URL for a piece has failed to load —
// asks Alchemy to re-fetch and re-cache that token's metadata/image from
// the origin, fixing it for future loads. Alchemy enforces its own
// 15-minutes-per-token cooldown, so this is safe to call on every failure.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> },
) {
  const session = await getWalletSession();
  if (!session.walletAddress) {
    return NextResponse.json({ error: "Please connect and verify your wallet" }, { status: 401 });
  }

  const { tokenId } = await params;
  const config = await getGalleryConfig();
  if (!config.nftContractAddress) {
    return NextResponse.json({ error: "Gallery not configured" }, { status: 404 });
  }

  try {
    const refreshed = await refreshTokenMetadata(config.nftContractAddress, tokenId, config.chainId);
    return NextResponse.json({ refreshed });
  } catch {
    return NextResponse.json({ error: "Failed to reach the NFT provider" }, { status: 502 });
  }
}
