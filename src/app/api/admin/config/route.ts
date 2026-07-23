import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAddress } from "viem";
import { getSession } from "@/lib/session";
import { setGalleryConfig } from "@/lib/config";

const configSchema = z.object({
  nftContractAddress: z.string().refine(isAddress, "Not a valid Ethereum address"),
  chainId: z.union([z.literal(1), z.literal(11155111)]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = configSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const config = await setGalleryConfig(parsed.data);
  return NextResponse.json({ config });
}
