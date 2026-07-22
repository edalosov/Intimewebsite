import { NextResponse } from "next/server";
import { getGalleryConfig } from "@/lib/config";
import { getOwnedTokens } from "@/lib/alchemy";
import { getWalletSession } from "@/lib/walletSession";

export async function GET() {
  const session = await getWalletSession();
  const owner = session.walletAddress;
  if (!owner) {
    return NextResponse.json({ error: "Please connect and verify your wallet" }, { status: 401 });
  }

  const config = await getGalleryConfig();
  if (!config.nftContractAddress) {
    return NextResponse.json({ configured: false, tokens: [] });
  }

  try {
    const tokens = await getOwnedTokens(owner, config.nftContractAddress, config.chainId);
    return NextResponse.json({ configured: true, tokens });
  } catch {
    return NextResponse.json({ error: "Failed to reach the NFT provider" }, { status: 502 });
  }
}
