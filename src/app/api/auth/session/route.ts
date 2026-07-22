import { NextResponse } from "next/server";
import { getWalletSession } from "@/lib/walletSession";

export async function GET() {
  const session = await getWalletSession();
  return NextResponse.json({ walletAddress: session.walletAddress ?? null });
}
