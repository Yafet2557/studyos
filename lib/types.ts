import type { Assignment, Course, Subtask } from "@/app/generated/prisma/client";

// Prisma's Decimal type isn't serializable across the server/client boundary.
// Use these types for any data passed from Server Components to Client Components.

export type SerializedAssignment = Omit<Assignment, "estimatedHours" | "dueDate" | "createdAt" | "updatedAt"> & {
  estimatedHours: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SerializedAssignmentWithRelations = SerializedAssignment & {
  course: Course | null;
  subtasks: SerializedSubtask[];
};

export type SerializedSubtask = Omit<Subtask, "createdAt"> & {
  createdAt: string;
};

export function serializeAssignment(
  assignment: Assignment & { course?: Course | null; subtasks?: Subtask[] }
): SerializedAssignmentWithRelations {
  return {
    ...assignment,
    estimatedHours: assignment.estimatedHours?.toString() ?? null,
    dueDate: assignment.dueDate?.toISOString() ?? null,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
    course: assignment.course ?? null,
    subtasks: (assignment.subtasks ?? []).map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
  };
}
