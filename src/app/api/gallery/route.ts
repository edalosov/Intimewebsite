import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getGalleryConfig } from "@/lib/config";
import { getOwnedTokens } from "@/lib/alchemy";

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("address");
  if (!owner || !isAddress(owner)) {
    return NextResponse.json({ error: "Missing or invalid address" }, { status: 400 });
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
