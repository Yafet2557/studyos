import { z } from "zod";

export const assignmentCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  courseId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  estimatedHours: z.coerce.number().min(0).max(999.9).optional(),
});

export const assignmentUpdateSchema = assignmentCreateSchema
  .partial()
  .extend({
    status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  });

export type AssignmentCreateInput = z.infer<typeof assignmentCreateSchema>;
export type AssignmentUpdateInput = z.infer<typeof assignmentUpdateSchema>;
