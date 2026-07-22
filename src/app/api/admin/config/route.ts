import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAddress } from "viem";
import { getSession } from "@/lib/session";
import { getGalleryConfig, setGalleryConfig, getActiveQuestion, setActiveQuestion } from "@/lib/config";

const SUPPORTED_CHAIN_IDS = [1, 11155111] as const;

const configSchema = z.object({
  nftContractAddress: z.string().refine(isAddress, "Not a valid Ethereum address"),
  chainId: z.union([z.literal(1), z.literal(11155111)]),
});

const questionSchema = z.object({
  text: z.string().min(1).max(500),
});

async function requireAdmin() {
  const session = await getSession();
  return session.isAdmin === true;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [config, question] = await Promise.all([getGalleryConfig(), getActiveQuestion()]);
  return NextResponse.json({ config, question, supportedChainIds: SUPPORTED_CHAIN_IDS });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.type === "config") {
    const parsed = configSchema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }
    const config = await setGalleryConfig(parsed.data);
    return NextResponse.json({ config });
  }

  if (body.type === "question") {
    const parsed = questionSchema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }
    const question = await setActiveQuestion(parsed.data.text);
    return NextResponse.json({ question });
  }

  return NextResponse.json({ error: "Unknown request type" }, { status: 400 });
}
