import { z } from "zod";

export const focusStartSchema = z.object({
  durationMins: z.coerce.number().int().min(1, "Minimum 1 minute").max(120, "Maximum 120 minutes"),
  courseId: z.string().optional(),
  assignmentId: z.string().optional(),
  label: z.string().max(100, "Label too long").optional(),
});

export const focusEndSchema = z.object({
  sessionId: z.string().min(1),
  actualSecs: z.coerce.number().int().min(0),
});

export type FocusStartInput = z.infer<typeof focusStartSchema>;
export type FocusEndInput = z.infer<typeof focusEndSchema>;
