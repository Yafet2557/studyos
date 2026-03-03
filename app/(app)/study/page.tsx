import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { serializeStudyCard, serializeStudySession } from "@/lib/types";
import { StudyPageClient } from "@/components/study/study-page-client";

export default async function StudyPage() {
  const userId = await getUser();
  const now = new Date();

  const [dueCount, recentSessions, allCards, courses, notes] =
    await Promise.all([
      prisma.studyCard.count({
        where: { userId, nextReviewAt: { lte: now } },
      }),
      prisma.studySession.findMany({
        where: { userId, completedAt: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.studyCard.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.findMany({
        where: { userId, isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.note.findMany({
        where: { userId },
        select: { id: true, title: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-normal tracking-tight animate-fade-up">
        Study
      </h1>
      <StudyPageClient
        dueCount={dueCount}
        totalCards={allCards.length}
        sessions={recentSessions.map((s) => serializeStudySession(s))}
        cards={allCards.map((c) => serializeStudyCard(c))}
        courses={courses}
        notes={notes}
      />
    </div>
  );
}
