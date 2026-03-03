import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ical, { VEvent } from "node-ical";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { url?: unknown; courseId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { url, courseId } = body;

  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }
  if (typeof courseId !== "string" || !courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const course = await prisma.course.findFirst({ where: { id: courseId, userId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  let events: Awaited<ReturnType<typeof ical.async.fromURL>>;
  try {
    events = await ical.async.fromURL(url.trim());
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch or parse ICS feed. Check that the URL is correct." },
      { status: 400 }
    );
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const assignments: { title: string; dueDate: string | null }[] = [];

  for (const key in events) {
    const raw = events[key];
    if (!raw || raw.type !== "VEVENT") continue;
    const event = raw as VEvent;

    const summary = typeof event.summary === "string" ? event.summary.trim() : "";
    if (!summary) continue;

    const end = event.end instanceof Date ? event.end : null;
    if (end && end < cutoff) continue;

    assignments.push({
      title: summary,
      dueDate: end ? end.toISOString() : null,
    });
  }

  assignments.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return NextResponse.json({ assignments });
}
