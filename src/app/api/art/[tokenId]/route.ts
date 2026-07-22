import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getGalleryConfig, getActiveQuestion } from "@/lib/config";
import { getTokenMetadata, isOwnerOfToken } from "@/lib/alchemy";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> },
) {
  const { tokenId } = await params;
  const address = req.nextUrl.searchParams.get("address");

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "Missing or invalid address" }, { status: 400 });
  }

  const config = await getGalleryConfig();
  if (!config.nftContractAddress) {
    return NextResponse.json({ error: "Gallery not configured" }, { status: 404 });
  }

  try {
    const isOwner = await isOwnerOfToken(address, config.nftContractAddress, tokenId, config.chainId);
    if (!isOwner) {
      return NextResponse.json({ error: "You do not own this piece" }, { status: 403 });
    }

    const [token, question, history] = await Promise.all([
      getTokenMetadata(config.nftContractAddress, tokenId, config.chainId),
      getActiveQuestion(),
      prisma.answer.findMany({
        where: { walletAddress: address.toLowerCase(), tokenId },
        include: { question: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ token, question, history });
  } catch {
    return NextResponse.json({ error: "Failed to reach the NFT provider" }, { status: 502 });
  }
}
