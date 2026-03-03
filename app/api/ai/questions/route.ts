import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const bodySchema = z.object({ noteId: z.string().min(1) });
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/ai/client";
import { studyQuestionsPrompt } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "noteId required" }, { status: 400 });
  }
  const { noteId } = parsed.data;

  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!note || note.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: studyQuestionsPrompt(note.content) }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const text = raw.replace(/```(?:json)?\n?/g, "").trim();

  let questions: string[];
  try {
    questions = z.array(z.string()).parse(JSON.parse(text));
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }

  await prisma.aiOutput.create({
    data: {
      userId,
      noteId,
      entityType: "NOTE",
      outputType: "QUESTIONS",
      content: questions,
      modelUsed: "claude-haiku-4-5",
    },
  });

  return NextResponse.json({ questions });
}
