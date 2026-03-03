import type { Priority, Status } from "@/app/generated/prisma/client";

const PRIORITY_WEIGHTS: Record<Priority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function calculateUrgency(assignment: {
  dueDate: Date | null;
  priority: Priority;
  status: Status;
}): number | null {
  if (!assignment.dueDate) return null;

  const now = new Date();
  const hoursUntilDue =
    (assignment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const weight = PRIORITY_WEIGHTS[assignment.priority];

  if (hoursUntilDue <= 0) {
    // Overdue: large offset ensures these always sort above upcoming
    return 10000 + (weight * 100) / Math.max(Math.abs(hoursUntilDue), 1);
  }

  return (weight * 100) / Math.max(hoursUntilDue, 1);
}

type AssignmentLike = {
  dueDate: Date | null;
  priority: Priority;
  status: Status;
};

export function sortByUrgency<T extends AssignmentLike>(assignments: T[]): {
  overdue: T[];
  upcoming: T[];
  noDeadline: T[];
  done: T[];
} {
  const overdue: T[] = [];
  const upcoming: T[] = [];
  const noDeadline: T[] = [];
  const done: T[] = [];

  const now = new Date();

  for (const a of assignments) {
    if (a.status === "DONE") {
      done.push(a);
      continue;
    }
    if (!a.dueDate) {
      noDeadline.push(a);
      continue;
    }
    if (a.dueDate < now) {
      overdue.push(a);
    } else {
      upcoming.push(a);
    }
  }

  const byUrgency = (a: T, b: T) =>
    (calculateUrgency(b) ?? 0) - (calculateUrgency(a) ?? 0);

  overdue.sort(byUrgency);
  upcoming.sort(byUrgency);

  return { overdue, upcoming, noDeadline, done };
}
