import Link from "next/link";
import type { Assignment, Course } from "@/app/generated/prisma/client";

type AssignmentWithCourse = Assignment & { course: Course | null };

function dueDateLabel(dueDate: Date): { label: string; urgent: boolean } {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  const days = Math.floor(Math.abs(hours) / 24);

  if (hours < 0) return { label: `${days}d overdue`, urgent: true };
  if (hours < 24) return { label: "Today", urgent: true };
  if (hours < 48) return { label: "Tomorrow", urgent: true };
  return { label: `${days}d`, urgent: false };
}

export function UpcomingAssignments({
  assignments,
}: {
  assignments: AssignmentWithCourse[];
}) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60">
        <span className="text-sm font-semibold tracking-tight">Upcoming</span>
      </div>

      <div>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-4">
            Nothing upcoming — you&apos;re clear.
          </p>
        ) : (
          assignments.map((a) => {
            const { label, urgent } = dueDateLabel(a.dueDate!);
            return (
              <Link
                key={a.id}
                href={`/assignments/${a.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors border-b border-border/40 last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  {a.course && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: a.course.color ?? "#64748b" }}
                      />
                      <span className="text-xs text-muted-foreground truncate">
                        {a.course.name}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs font-mono ml-4 whitespace-nowrap ${
                    urgent ? "text-destructive font-medium" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
