import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { sessionSecret } from "@/lib/sessionSecret";

export interface WalletSessionData {
  walletAddress?: string;
}

export const walletSessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: "unfinishedpast_wallet_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getWalletSession() {
  const cookieStore = await cookies();
  return getIronSession<WalletSessionData>(cookieStore, walletSessionOptions);
}
