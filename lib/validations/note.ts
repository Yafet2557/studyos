import { z } from "zod";

export const noteCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  courseId: z.string().optional(),
  assignmentId: z.string().optional(),
});

export const noteUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  courseId: z.string().optional(),
  assignmentId: z.string().optional(),
});

export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
