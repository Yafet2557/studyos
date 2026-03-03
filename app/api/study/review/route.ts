import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSubmitSchema } from "@/lib/validations/study";
import { applyReview } from "@/lib/utils/sm2";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = reviewSubmitSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sessionId, cardId, quality } = parsed.data;

  const [card, studySession] = await Promise.all([
    prisma.studyCard.findUnique({ where: { id: cardId } }),
    prisma.studySession.findUnique({ where: { id: sessionId } }),
  ]);

  if (!card || card.userId !== userId) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }
  if (!studySession || studySession.userId !== userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const result = applyReview({
    easeFactor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
    quality,
  });

  await prisma.$transaction([
    prisma.studyCard.update({
      where: { id: cardId },
      data: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReviewAt: result.nextReviewAt,
        lastReviewAt: new Date(),
      },
    }),
    prisma.studyCardReview.create({
      data: {
        studyCardId: cardId,
        sessionId,
        quality,
        easeFactor: result.easeFactor,
        interval: result.interval,
      },
    }),
  ]);

  return NextResponse.json({
    easeFactor: result.easeFactor,
    interval: result.interval,
    repetitions: result.repetitions,
    nextReviewAt: result.nextReviewAt.toISOString(),
  });
}
