import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;

function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { blocked, retryAfterMs } = checkRateLimit(`admin-login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (blocked) {
    return NextResponse.json(
      { error: "Too many attempts, please try again later" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "Admin password is not configured" }, { status: 500 });
  }

  if (typeof password !== "string" || !safeCompare(password, adminPassword)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
