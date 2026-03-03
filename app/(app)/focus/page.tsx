import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { serializeFocusSession } from "@/lib/types";
import { FocusPageClient } from "@/components/focus/focus-page-client";

export default async function FocusPage() {
  const userId = await getUser();

  const [courses, assignments, recentSessions] = await Promise.all([
    prisma.course.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.assignment.findMany({
      where: { userId, status: { not: "DONE" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.focusSession.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const serializedAssignments = assignments.map((a) => ({
    ...a,
    estimatedHours: a.estimatedHours?.toString() ?? null,
    dueDate: a.dueDate?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-normal tracking-tight animate-fade-up">
        Focus
      </h1>
      <FocusPageClient
        courses={courses}
        assignments={serializedAssignments}
        recentSessions={recentSessions.map(serializeFocusSession)}
      />
    </div>
  );
}
