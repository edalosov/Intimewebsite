import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { listQuestions, createQuestion } from "@/lib/config";

const createSchema = z.object({
  text: z.string().min(1).max(500),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const questions = await listQuestions();
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const question = await createQuestion({ text: parsed.data.text, startsAt, endsAt });
    return NextResponse.json({ question });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create question" }, { status: 400 });
  }
}
