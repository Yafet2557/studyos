import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { courseId?: unknown; assignments?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { courseId, assignments } = body;

  if (typeof courseId !== "string" || !courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }
  if (!Array.isArray(assignments)) {
    return NextResponse.json({ error: "assignments is required" }, { status: 400 });
  }

  const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  let created = 0;

  for (const a of assignments) {
    if (typeof a?.title !== "string" || !a.title.trim()) continue;

    const exists = await prisma.assignment.findFirst({
      where: { userId, courseId, title: a.title },
    });
    if (exists) continue;

    await prisma.assignment.create({
      data: {
        userId,
        courseId,
        title: a.title,
        dueDate: typeof a.dueDate === "string" ? new Date(a.dueDate) : undefined,
        status: "TODO",
        priority: "MEDIUM",
      },
    });
    created++;
  }

  return NextResponse.json({ created });
}
