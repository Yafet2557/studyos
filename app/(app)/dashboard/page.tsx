import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { DailyBriefing } from "@/components/dashboard/daily-briefing";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { UpcomingAssignments } from "@/components/dashboard/upcoming-assignments";
import { RecentNotes } from "@/components/dashboard/recent-notes";

export default async function DashboardPage() {
  const userId = await getUser();

  const now = new Date();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);

  const [upcomingAssignments, recentNotes, overdueCount, dueThisWeekCount, cachedPlan] =
    await Promise.all([
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
    ]);

  const planText =
    cachedPlan && typeof cachedPlan.content === "string" ? cachedPlan.content : null;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-normal tracking-tight animate-fade-up">Dashboard</h1>

      <DashboardStats
        overdueCount={overdueCount}
        dueThisWeekCount={dueThisWeekCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyBriefing cachedPlan={planText} />
        <div className="space-y-6">
          <UpcomingAssignments assignments={upcomingAssignments} />
          <RecentNotes notes={recentNotes} />
        </div>
      </div>
    </div>
  );
}
