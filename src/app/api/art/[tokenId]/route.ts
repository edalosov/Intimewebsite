import { NextRequest, NextResponse } from "next/server";
import { getGalleryConfig, getActiveQuestion } from "@/lib/config";
import { getTokenMetadata } from "@/lib/alchemy";
import { resolveTokenAccess } from "@/lib/access";
import { getWalletSession } from "@/lib/walletSession";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> },
) {
  const { tokenId } = await params;

  const session = await getWalletSession();
  const address = session.walletAddress;
  if (!address) {
    return NextResponse.json({ error: "Please connect and verify your wallet" }, { status: 401 });
  }

  const config = await getGalleryConfig();
  if (!config.nftContractAddress) {
    return NextResponse.json({ error: "Gallery not configured" }, { status: 404 });
  }

  try {
    const { allowed, ownerAddress } = await resolveTokenAccess(
      address,
      config.nftContractAddress,
      tokenId,
      config.chainId,
    );
    if (!allowed || !ownerAddress) {
      return NextResponse.json({ error: "You do not own this piece" }, { status: 403 });
    }

    const [token, question, history] = await Promise.all([
      getTokenMetadata(config.nftContractAddress, tokenId, config.chainId),
      getActiveQuestion(),
      prisma.answer.findMany({
        where: { walletAddress: ownerAddress, tokenId },
        include: { question: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ token, question, history });
  } catch {
    return NextResponse.json({ error: "Failed to reach the NFT provider" }, { status: 502 });
  }
}
