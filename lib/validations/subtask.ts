import { z } from "zod";

export const subtaskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  assignmentId: z.string().min(1),
});

export type SubtaskCreateInput = z.infer<typeof subtaskCreateSchema>;
