import { z } from "zod";

export const studyCardCreateSchema = z.object({
  front: z.string().min(1, "Front is required").max(1000),
  back: z.string().min(1, "Back is required").max(2000),
  courseId: z.string().optional(),
});

export const studyCardUpdateSchema = studyCardCreateSchema.partial();

export const reviewSubmitSchema = z.object({
  sessionId: z.string().min(1),
  cardId: z.string().min(1),
  quality: z.coerce.number().int().min(0).max(5),
});

export const sessionStartSchema = z.object({
  courseId: z.string().optional(),
  type: z.enum(["REVIEW", "LEARN", "CRAM"]).default("REVIEW"),
});

export const sessionEndSchema = z.object({
  sessionId: z.string().min(1),
  durationSecs: z.coerce.number().int().min(0),
  cardsStudied: z.coerce.number().int().min(0),
  correctCount: z.coerce.number().int().min(0),
});

export type StudyCardCreateInput = z.infer<typeof studyCardCreateSchema>;
export type StudyCardUpdateInput = z.infer<typeof studyCardUpdateSchema>;
