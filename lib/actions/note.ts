"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { noteCreateSchema, noteUpdateSchema } from "@/lib/validations/note";

export async function createNote(formData: FormData) {
  const userId = await getUser();

  const rawCourseId = formData.get("courseId") as string | null;
  const rawAssignmentId = formData.get("assignmentId") as string | null;

  const parsed = noteCreateSchema.safeParse({
    title: formData.get("title"),
    courseId: rawCourseId && rawCourseId !== "none" ? rawCourseId : undefined,
    assignmentId: rawAssignmentId && rawAssignmentId !== "none" ? rawAssignmentId : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { courseId, assignmentId } = parsed.data;

  if (courseId) {
    const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
    if (!course) return { error: "Course not found" };
  }

  if (assignmentId) {
    const assignment = await prisma.assignment.findFirst({ where: { id: assignmentId, userId } });
    if (!assignment) return { error: "Assignment not found" };
  }

  const note = await prisma.note.create({
    data: {
      ...parsed.data,
      userId,
    },
  });

  revalidatePath("/notes");
  redirect(`/notes/${note.id}`);
}

export async function updateNote(noteId: string, formData: FormData) {
  const userId = await getUser();

  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });
  if (!note || note.userId !== userId) return { error: "Not found" };

  const rawCourseId = formData.get("courseId") as string | null;
  const rawAssignmentId = formData.get("assignmentId") as string | null;

  const parsed = noteUpdateSchema.safeParse({
    title: formData.get("title") || undefined,
    content: formData.get("content") ?? undefined,
    courseId: rawCourseId && rawCourseId !== "none" ? rawCourseId : undefined,
    assignmentId: rawAssignmentId && rawAssignmentId !== "none" ? rawAssignmentId : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { courseId, assignmentId } = parsed.data;

  if (courseId) {
    const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
    if (!course) return { error: "Course not found" };
  }

  if (assignmentId) {
    const assignment = await prisma.assignment.findFirst({ where: { id: assignmentId, userId } });
    if (!assignment) return { error: "Assignment not found" };
  }

  await prisma.note.update({
    where: { id: noteId },
    data: parsed.data,
  });

  revalidatePath("/notes");
  revalidatePath(`/notes/${noteId}`);
}

export async function deleteNote(noteId: string) {
  const userId = await getUser();

  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });
  if (!note || note.userId !== userId) return { error: "Not found" };

  await prisma.note.delete({ where: { id: noteId } });

  revalidatePath("/notes");
  redirect("/notes");
}
