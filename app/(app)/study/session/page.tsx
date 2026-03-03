import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { serializeStudyCard, serializeStudySession } from "@/lib/types";
import { SessionClient } from "@/components/study/session-client";

export default async function StudySessionPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { sessionId } = await searchParams;
  if (!sessionId) redirect("/study");

  const userId = await getUser();

  const session = await prisma.studySession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) redirect("/study");
  if (session.completedAt) redirect("/study");

  const now = new Date();
  const cards = await prisma.studyCard.findMany({
    where: {
      userId,
      nextReviewAt: { lte: now },
      ...(session.courseId ? { courseId: session.courseId } : {}),
    },
    orderBy: { nextReviewAt: "asc" },
    take: 20,
  });

  if (cards.length === 0) redirect("/study");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <SessionClient
        session={serializeStudySession(session)}
        cards={cards.map((c) => serializeStudyCard(c))}
      />
    </div>
  );
}
