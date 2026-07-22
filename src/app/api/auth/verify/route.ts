import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAddress, recoverMessageAddress, type Hex } from "viem";
import { buildSignInMessage } from "@/lib/authMessage";
import { getWalletSession } from "@/lib/walletSession";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const bodySchema = z.object({
  walletAddress: z.string().refine(isAddress),
  timestamp: z.number(),
  signature: z.string().startsWith("0x"),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { walletAddress, timestamp, signature } = parsed.data;

  if (Math.abs(Date.now() - timestamp) > FIVE_MINUTES_MS) {
    return NextResponse.json({ error: "Sign-in request expired, please try again" }, { status: 401 });
  }

  const message = buildSignInMessage({ walletAddress, timestamp });
  let recovered: string;
  try {
    recovered = await recoverMessageAddress({ message, signature: signature as Hex });
  } catch {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
  }

  const session = await getWalletSession();
  session.walletAddress = walletAddress.toLowerCase();
  await session.save();

  return NextResponse.json({ walletAddress: session.walletAddress });
}
