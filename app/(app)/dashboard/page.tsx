import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { auth } from "@/lib/auth";
import { DailyBriefing } from "@/components/dashboard/daily-briefing";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { UpcomingAssignments } from "@/components/dashboard/upcoming-assignments";
import { RecentNotes } from "@/components/dashboard/recent-notes";
import { CourseProgress } from "@/components/dashboard/course-progress";

export default async function DashboardPage() {
  const userId = await getUser();

  // Derive a display name from the session email (no name field in schema)
  const session = await auth();
  const email = session?.user?.email ?? "";
  const displayName = email
    ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)
    : "";

  const now = new Date();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    upcomingAssignments,
    recentNotes,
    overdueCount,
    dueThisWeekCount,
    cachedPlan,
    focusSessions,
    courses,
    assignmentCounts,
  ] = await Promise.all([
    prisma.assignment.findMany({
      where: { userId, status: { not: "DONE" }, dueDate: { not: null } },
      include: { course: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    prisma.assignment.count({
      where: { userId, status: { not: "DONE" }, dueDate: { lt: now } },
    }),
    prisma.assignment.count({
      where: {
        userId,
        status: { not: "DONE" },
        dueDate: { gte: now, lte: weekEnd },
      },
    }),
    prisma.aiOutput.findFirst({
      where: { userId, outputType: "PLAN", createdAt: { gte: todayStart } },
      orderBy: { createdAt: "desc" },
    }),
    // Weekly focus: all focus sessions in the last 7 days
    prisma.focusSession.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      select: { actualSecs: true, createdAt: true },
    }),
    prisma.course.findMany({
      where: { userId },
      select: { id: true, name: true, color: true },
      orderBy: { createdAt: "asc" },
    }),
    // All assignments for course progress counting
    prisma.assignment.findMany({
      where: { userId },
      select: { courseId: true, status: true },
    }),
  ]);

  const planText =
    cachedPlan && typeof cachedPlan.content === "string" ? cachedPlan.content : null;

  // Weekly focus hours — sum actualSecs, fallback to durationMins*60 if actualSecs is null
  const weeklyFocusSecs = focusSessions.reduce((sum, s) => {
    return sum + (s.actualSecs ?? 0);
  }, 0);
  const weeklyFocusHours = weeklyFocusSecs / 3600;

  // Study streak — count consecutive days (back from today) with at least one focus session
  // Build a Set of ISO date strings (YYYY-MM-DD) that have activity
  const activeDaySet = new Set<string>();
  for (const s of focusSessions) {
    activeDaySet.add(s.createdAt.toISOString().slice(0, 10));
  }

  // Also pull study sessions for the streak (up to 90 days back is enough)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const studySessions = await prisma.studySession.findMany({
    where: { userId, createdAt: { gte: ninetyDaysAgo } },
    select: { createdAt: true },
  });
  for (const s of studySessions) {
    activeDaySet.add(s.createdAt.toISOString().slice(0, 10));
  }

  let studyStreakDays = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (true) {
    const dateKey = cursor.toISOString().slice(0, 10);
    if (!activeDaySet.has(dateKey)) break;
    studyStreakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Course progress — map courseId → { total, completed }
  const progressMap = new Map<string | null, { total: number; completed: number }>();
  for (const row of assignmentCounts) {
    const key = row.courseId ?? null;
    if (!progressMap.has(key)) {
      progressMap.set(key, { total: 0, completed: 0 });
    }
    const entry = progressMap.get(key)!;
    entry.total += 1;
    if (row.status === "DONE") {
      entry.completed += 1;
    }
  }

  const courseProgressItems = courses.map((c) => {
    const counts = progressMap.get(c.id) ?? { total: 0, completed: 0 };
    return {
      id: c.id,
      name: c.name,
      color: c.color ?? "#64748b",
      total: counts.total,
      completed: counts.completed,
    };
  });

  const hour = now.getHours();
  const greeting =
    hour >= 5 && hour <= 11
      ? "morning"
      : hour >= 12 && hour <= 16
        ? "afternoon"
        : "evening";
  const greetingLine = displayName
    ? `Good ${greeting}, ${displayName}`
    : `Good ${greeting}`;

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <p className="text-sm text-muted-foreground mb-1">{greetingLine}</p>
        <h1 className="text-3xl font-serif font-normal tracking-tight">Dashboard</h1>
      </div>

      <DashboardStats
        overdueCount={overdueCount}
        dueThisWeekCount={dueThisWeekCount}
        weeklyFocusHours={weeklyFocusHours}
        studyStreakDays={studyStreakDays}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        <div className="lg:row-span-2">
          <DailyBriefing cachedPlan={planText} />
        </div>
        <div className="space-y-6">
          <UpcomingAssignments assignments={upcomingAssignments} />
          <RecentNotes notes={recentNotes} />
        </div>
      </div>

      {courseProgressItems.length > 0 && (
        <CourseProgress courses={courseProgressItems} />
      )}
    </div>
  );
}
