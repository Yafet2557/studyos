"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { courseCreateSchema, courseUpdateSchema } from "@/lib/validations/course";

export async function createCourse(formData: FormData) {
  const userId = await getUser();

  const parsed = courseCreateSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.course.create({
    data: { ...parsed.data, userId },
  });

  revalidatePath("/courses");
  redirect("/courses");
}

export async function updateCourse(courseId: string, formData: FormData) {
  const userId = await getUser();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.userId !== userId) return { error: "Not found" };

  const parsed = courseUpdateSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.course.update({
    where: { id: courseId },
    data: parsed.data,
  });

  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  const userId = await getUser();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.userId !== userId) return { error: "Not found" };

  await prisma.course.delete({ where: { id: courseId } });

  revalidatePath("/courses");
  redirect("/courses");
}

export async function toggleCourseActive(courseId: string) {
  const userId = await getUser();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.userId !== userId) return { error: "Not found" };

  await prisma.course.update({
    where: { id: courseId },
    data: { isActive: !course.isActive },
  });

  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
}
