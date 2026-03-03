"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { studyCardCreateSchema, studyCardUpdateSchema } from "@/lib/validations/study";

export async function createStudyCard(formData: FormData) {
  const userId = await getUser();

  const rawCourseId = formData.get("courseId") as string | null;

  const parsed = studyCardCreateSchema.safeParse({
    front: formData.get("front"),
    back: formData.get("back"),
    courseId: rawCourseId && rawCourseId !== "none" ? rawCourseId : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { courseId } = parsed.data;

  if (courseId) {
    const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
    if (!course) return { error: "Course not found" };
  }

  await prisma.studyCard.create({
    data: {
      front: parsed.data.front,
      back: parsed.data.back,
      courseId: courseId ?? null,
      userId,
      source: "MANUAL",
      nextReviewAt: new Date(),
    },
  });

  revalidatePath("/study");
}

export async function updateStudyCard(cardId: string, formData: FormData) {
  const userId = await getUser();

  const card = await prisma.studyCard.findUnique({ where: { id: cardId } });
  if (!card || card.userId !== userId) return { error: "Not found" };

  const rawCourseId = formData.get("courseId") as string | null;

  const parsed = studyCardUpdateSchema.safeParse({
    front: formData.get("front") || undefined,
    back: formData.get("back") || undefined,
    courseId: rawCourseId && rawCourseId !== "none" ? rawCourseId : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { courseId } = parsed.data;

  if (courseId) {
    const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
    if (!course) return { error: "Course not found" };
  }

  await prisma.studyCard.update({
    where: { id: cardId },
    data: {
      ...parsed.data,
      courseId: courseId ?? null,
    },
  });

  revalidatePath("/study");
}

export async function deleteStudyCard(cardId: string) {
  const userId = await getUser();

  const card = await prisma.studyCard.findUnique({ where: { id: cardId } });
  if (!card || card.userId !== userId) return { error: "Not found" };

  await prisma.studyCard.delete({ where: { id: cardId } });

  revalidatePath("/study");
}
