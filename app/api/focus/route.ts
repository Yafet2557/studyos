import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { focusStartSchema, focusEndSchema } from "@/lib/validations/focus";
import { serializeFocusSession } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = focusStartSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { durationMins, courseId, assignmentId, label } = parsed.data;

  if (courseId) {
    const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
  }

  if (assignmentId) {
    const assignment = await prisma.assignment.findFirst({ where: { id: assignmentId, userId } });
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }
  }

  const focusSession = await prisma.focusSession.create({
    data: {
      userId,
      durationMins,
      courseId: courseId ?? null,
      assignmentId: assignmentId ?? null,
      label: label ?? null,
    },
  });

  return NextResponse.json({ session: serializeFocusSession(focusSession) });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const parsed = focusEndSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { sessionId, actualSecs } = parsed.data;

  const focusSession = await prisma.focusSession.findUnique({ where: { id: sessionId } });
  if (!focusSession || focusSession.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.focusSession.update({
    where: { id: sessionId },
    data: {
      actualSecs,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ session: serializeFocusSession(updated) });
}
