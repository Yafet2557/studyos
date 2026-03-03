import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/ai/client";
import { flashcardGenerationPrompt } from "@/lib/ai/prompts";

const bodySchema = z.object({ noteId: z.string().min(1) });

const cardSchema = z.array(
  z.object({
    front: z.string().min(1).max(1000),
    back: z.string().min(1).max(2000),
  })
);

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

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!note.content.trim()) {
    return NextResponse.json({ error: "Note has no content" }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: flashcardGenerationPrompt(note.title, note.content),
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const text = raw.replace(/```(?:json)?\n?/g, "").trim();

  let cards: z.infer<typeof cardSchema>;
  try {
    cards = cardSchema.parse(JSON.parse(text));
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }

  await prisma.studyCard.createMany({
    data: cards.map((card) => ({
      front: card.front,
      back: card.back,
      userId,
      noteId,
      courseId: note.courseId,
      source: "NOTE" as const,
      nextReviewAt: new Date(),
    })),
  });

  return NextResponse.json({ cards, count: cards.length });
}
