import type { Assignment, Course, StudyCard, StudyCardReview, StudySession, Subtask } from "@/app/generated/prisma/client";

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

// StudyCard: nextReviewAt/lastReviewAt/createdAt/updatedAt are DateTime
export type SerializedStudyCard = Omit<StudyCard, "createdAt" | "updatedAt" | "nextReviewAt" | "lastReviewAt"> & {
  createdAt: string;
  updatedAt: string;
  nextReviewAt: string;
  lastReviewAt: string | null;
};

export type SerializedStudyCardWithReviews = SerializedStudyCard & {
  reviews: SerializedStudyCardReview[];
};

export type SerializedStudyCardReview = Omit<StudyCardReview, "createdAt"> & {
  createdAt: string;
};

// StudySession: createdAt/completedAt are DateTime
export type SerializedStudySession = Omit<StudySession, "createdAt" | "completedAt"> & {
  createdAt: string;
  completedAt: string | null;
};

export type SerializedStudySessionWithReviews = SerializedStudySession & {
  reviews: SerializedStudyCardReview[];
};

export function serializeStudyCard(
  card: StudyCard & { reviews?: StudyCardReview[] }
): SerializedStudyCardWithReviews {
  return {
    ...card,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
    nextReviewAt: card.nextReviewAt.toISOString(),
    lastReviewAt: card.lastReviewAt?.toISOString() ?? null,
    reviews: (card.reviews ?? []).map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export function serializeStudySession(
  session: StudySession & { reviews?: StudyCardReview[] }
): SerializedStudySessionWithReviews {
  return {
    ...session,
    createdAt: session.createdAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    reviews: (session.reviews ?? []).map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

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
