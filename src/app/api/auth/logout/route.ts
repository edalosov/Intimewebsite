import { NextResponse } from "next/server";
import { getWalletSession } from "@/lib/walletSession";

export async function POST() {
  const session = await getWalletSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
