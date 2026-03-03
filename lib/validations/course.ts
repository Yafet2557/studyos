import { z } from "zod";

export const courseCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  code: z.string().max(20).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color").optional(),
});

export const courseUpdateSchema = courseCreateSchema.partial();

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;
