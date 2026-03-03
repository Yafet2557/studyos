"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import {
  assignmentCreateSchema,
  assignmentUpdateSchema,
} from "@/lib/validations/assignment";
import type { Priority, Status } from "@/app/generated/prisma/client";

const statusSchema = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);
const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

async function verifyCourseOwnership(courseId: string | undefined, userId: string) {
  if (!courseId || courseId === "none") return null;
  const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
  if (!course) throw new Error("Invalid course");
  return courseId;
}

export async function createAssignment(formData: FormData) {
  const userId = await getUser();

  const parsed = assignmentCreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    courseId: formData.get("courseId") || undefined,
    priority: formData.get("priority"),
    estimatedHours: formData.get("estimatedHours") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let courseId: string | undefined;
  try {
    courseId = await verifyCourseOwnership(parsed.data.courseId, userId) ?? undefined;
  } catch {
    return { error: "Invalid course" };
  }

  const { dueDate, estimatedHours, courseId: _cid, ...rest } = parsed.data;

  const assignment = await prisma.assignment.create({
    data: {
      ...rest,
      userId,
      courseId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours: estimatedHours ?? undefined,
    },
  });

  revalidatePath("/assignments");
  if (courseId) revalidatePath(`/courses/${courseId}`);

  redirect(`/assignments/${assignment.id}`);
}

export async function updateAssignment(assignmentId: string, formData: FormData) {
  const userId = await getUser();

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment || assignment.userId !== userId) return { error: "Not found" };

  const parsed = assignmentUpdateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    courseId: formData.get("courseId") || undefined,
    priority: formData.get("priority"),
    estimatedHours: formData.get("estimatedHours") || undefined,
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let courseId: string | null | undefined;
  try {
    const raw = formData.get("courseId") as string | null;
    if (raw === "none" || raw === "" || raw === null) {
      courseId = null;
    } else if (raw) {
      courseId = await verifyCourseOwnership(raw, userId);
    }
  } catch {
    return { error: "Invalid course" };
  }

  const rawDueDate = formData.get("dueDate") as string | null;
  const rawEstimatedHours = formData.get("estimatedHours") as string | null;
  const { dueDate: _dd, estimatedHours: _eh, courseId: _cid, ...rest } = parsed.data;

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      ...rest,
      courseId,
      dueDate: rawDueDate ? new Date(rawDueDate) : null,
      estimatedHours: rawEstimatedHours ? parseFloat(rawEstimatedHours) : null,
    },
  });

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  if (assignment.courseId) revalidatePath(`/courses/${assignment.courseId}`);
}

export async function deleteAssignment(assignmentId: string) {
  const userId = await getUser();

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment || assignment.userId !== userId) return { error: "Not found" };

  await prisma.assignment.delete({ where: { id: assignmentId } });

  revalidatePath("/assignments");
  if (assignment.courseId) revalidatePath(`/courses/${assignment.courseId}`);
  redirect("/assignments");
}

export async function updateAssignmentStatus(
  assignmentId: string,
  status: Status
) {
  const userId = await getUser();

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { error: "Invalid status" };

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment || assignment.userId !== userId) return { error: "Not found" };

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { status: parsed.data },
  });

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
}

export async function updateAssignmentPriority(
  assignmentId: string,
  priority: Priority
) {
  const userId = await getUser();

  const parsed = prioritySchema.safeParse(priority);
  if (!parsed.success) return { error: "Invalid priority" };

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment || assignment.userId !== userId) return { error: "Not found" };

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { priority: parsed.data },
  });

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
}
