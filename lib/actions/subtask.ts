"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { subtaskCreateSchema } from "@/lib/validations/subtask";

export async function createSubtask(formData: FormData) {
  const userId = await getUser();

  const parsed = subtaskCreateSchema.safeParse({
    title: formData.get("title"),
    assignmentId: formData.get("assignmentId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify assignment ownership
  const assignment = await prisma.assignment.findUnique({
    where: { id: parsed.data.assignmentId },
  });
  if (!assignment || assignment.userId !== userId) return { error: "Not found" };

  // Set position to max + 1
  const last = await prisma.subtask.findFirst({
    where: { assignmentId: parsed.data.assignmentId },
    orderBy: { position: "desc" },
  });

  await prisma.subtask.create({
    data: {
      ...parsed.data,
      userId,
      position: (last?.position ?? -1) + 1,
    },
  });

  revalidatePath(`/assignments/${parsed.data.assignmentId}`);
}

export async function toggleSubtask(subtaskId: string) {
  const userId = await getUser();

  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
  });
  if (!subtask || subtask.userId !== userId) return { error: "Not found" };

  await prisma.subtask.update({
    where: { id: subtaskId },
    data: { isDone: !subtask.isDone },
  });

  revalidatePath(`/assignments/${subtask.assignmentId}`);
}

export async function deleteSubtask(subtaskId: string) {
  const userId = await getUser();

  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
  });
  if (!subtask || subtask.userId !== userId) return { error: "Not found" };

  await prisma.subtask.delete({ where: { id: subtaskId } });

  revalidatePath(`/assignments/${subtask.assignmentId}`);
}
