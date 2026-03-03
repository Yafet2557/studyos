import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sessionStartSchema, sessionEndSchema } from "@/lib/validations/study";
import { serializeStudyCard, serializeStudySession } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const parsed = sessionStartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { courseId, type } = parsed.data;

  if (courseId) {
    const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
  }

  const now = new Date();
  const dueCards = await prisma.studyCard.findMany({
    where: {
      userId,
      nextReviewAt: { lte: now },
      ...(courseId ? { courseId } : {}),
    },
    orderBy: { nextReviewAt: "asc" },
    take: 20,
  });

  if (dueCards.length === 0) {
    return NextResponse.json({
      session: null,
      cards: [],
      message: "No cards due for review",
    });
  }

  const studySession = await prisma.studySession.create({
    data: {
      userId,
      courseId: courseId ?? null,
      type,
    },
  });

  return NextResponse.json({
    session: serializeStudySession(studySession),
    cards: dueCards.map((c) => serializeStudyCard(c)),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = sessionEndSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sessionId, durationSecs, cardsStudied, correctCount } = parsed.data;

  const studySession = await prisma.studySession.findUnique({
    where: { id: sessionId },
  });
  if (!studySession || studySession.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.studySession.update({
    where: { id: sessionId },
    data: {
      completedAt: new Date(),
      durationSecs,
      cardsStudied,
      correctCount,
    },
  });

  return NextResponse.json({ session: serializeStudySession(updated) });
}
