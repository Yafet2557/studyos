import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { sortByUrgency } from "@/lib/utils/urgency";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AssignmentListClient } from "@/components/assignments/assignment-list-client";

export default async function AssignmentsPage() {
  const userId = await getUser();

  const [assignments, courses] = await Promise.all([
    prisma.assignment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const { overdue, upcoming, noDeadline, done } = sortByUrgency(assignments);

  return (
    <div className="space-y-6">
      <AssignmentListClient courses={courses} />

      {assignments.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No assignments yet</p>
          <p className="text-sm mt-1">Create your first assignment to get started.</p>
        </div>
      )}

      {overdue.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide">
            Overdue ({overdue.length})
          </h2>
          <div className="space-y-2">
            {overdue.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Upcoming
          </h2>
          <div className="space-y-2">
            {upcoming.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}

      {noDeadline.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            No Deadline
          </h2>
          <div className="space-y-2">
            {noDeadline.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">
            Completed ({done.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {done.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
