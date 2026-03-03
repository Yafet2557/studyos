import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  courses: z.array(
    z.object({
      name: z.string().min(1),
      assignments: z.array(
        z.object({
          title: z.string().min(1),
          dueDate: z.string().nullable().optional(),
        })
      ).default([]),
    })
  ).default([]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parseResult = bodySchema.safeParse(await req.json());
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { courses } = parseResult.data;

  let createdCourses = 0;
  let createdAssignments = 0;

  for (const course of courses) {
    let existing = await prisma.course.findFirst({
      where: { userId, name: course.name },
    });

    if (!existing) {
      existing = await prisma.course.create({
        data: { userId, name: course.name, isActive: true },
      });
      createdCourses++;
    }

    const courseId = existing.id;

    for (const assignment of course.assignments) {
      const alreadyExists = await prisma.assignment.findFirst({
        where: { userId, title: assignment.title, courseId },
      });

      if (alreadyExists) continue;

      const parsedDate = assignment.dueDate ? new Date(assignment.dueDate) : undefined;
      const dueDate = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : undefined;

      await prisma.assignment.create({
        data: {
          userId,
          title: assignment.title,
          courseId,
          dueDate,
          status: "TODO",
          priority: "MEDIUM",
        },
      });
      createdAssignments++;
    }
  }

  return NextResponse.json({
    created: { courses: createdCourses, assignments: createdAssignments },
  });
}
