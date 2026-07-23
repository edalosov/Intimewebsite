import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAddress, type Hex } from "viem";
import { getGalleryConfig, getActiveQuestion } from "@/lib/config";
import { resolveTokenAccess } from "@/lib/access";
import { verifyAnswerSignature } from "@/lib/verifySignature";
import { prisma } from "@/lib/db";

const bodySchema = z.object({
  walletAddress: z.string().refine(isAddress),
  tokenId: z.string().min(1),
  answerText: z.string().min(1).max(300),
  timestamp: z.number(),
  signature: z.string().startsWith("0x"),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { walletAddress, tokenId, answerText, timestamp, signature } = parsed.data;

  const question = await getActiveQuestion();
  if (!question) {
    return NextResponse.json({ error: "No active question set" }, { status: 400 });
  }

  const config = await getGalleryConfig();
  if (!config.nftContractAddress) {
    return NextResponse.json({ error: "Gallery not configured" }, { status: 400 });
  }

  let ownerAddress: string | null;
  try {
    const access = await resolveTokenAccess(walletAddress, config.nftContractAddress, tokenId, config.chainId);
    if (!access.allowed || !access.ownerAddress) {
      return NextResponse.json({ error: "You do not own this piece" }, { status: 403 });
    }
    ownerAddress = access.ownerAddress;
  } catch {
    return NextResponse.json({ error: "Failed to reach the NFT provider" }, { status: 502 });
  }

  // Signature verification is always against the connecting wallet — that's
  // whoever actually holds the signing key, whether that's the owner or a
  // delegate.xyz-delegated hot wallet.
  const signatureValid = await verifyAnswerSignature({
    tokenId,
    questionText: question.text,
    answerText,
    timestamp,
    signature: signature as Hex,
    claimedAddress: walletAddress,
  });
  if (!signatureValid) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  const signer = walletAddress.toLowerCase();
  const signerAddress = signer === ownerAddress ? null : signer;

  const answer = await prisma.answer.upsert({
    where: {
      walletAddress_tokenId_questionId: {
        walletAddress: ownerAddress,
        tokenId,
        questionId: question.id,
      },
    },
    update: { answerText, signature, signerAddress },
    create: {
      walletAddress: ownerAddress,
      signerAddress,
      tokenId,
      questionId: question.id,
      answerText,
      signature,
    },
    include: { question: true },
  });

  return NextResponse.json({ answer });
}
