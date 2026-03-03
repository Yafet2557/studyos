import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import ical, { VEvent } from "node-ical";

function extractCourseName(
  categories: { [p: string]: string } | string[] | string | undefined,
  summary: string
): string {
  if (categories !== undefined && categories !== null) {
    if (typeof categories === "string" && categories.trim().length > 0) {
      return categories.trim();
    }
    if (Array.isArray(categories) && categories.length > 0) {
      return categories[0].trim();
    }
    if (typeof categories === "object" && !Array.isArray(categories)) {
      const vals = Object.values(categories);
      if (vals.length > 0 && typeof vals[0] === "string" && vals[0].trim().length > 0) {
        return vals[0].trim();
      }
    }
  }

  const match = summary.match(/[A-Z]{2,4}\d{4}/);
  if (match) return match[0];

  return "Uncategorized";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const url: unknown = body?.url;

  if (typeof url !== "string" || url.trim().length === 0) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
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

  const courseMap = new Map<
    string,
    { name: string; assignments: { title: string; dueDate: string | null }[] }
  >();

  for (const key in events) {
    const raw = events[key];
    if (!raw || raw.type !== "VEVENT") continue;
    const event = raw as VEvent;

    const summary = typeof event.summary === "string" ? event.summary.trim() : "";
    if (!summary) continue;

    const end = event.end instanceof Date ? event.end : null;

    if (end && end < cutoff) continue;

    const dueDate = end ? end.toISOString() : null;

    const courseName = extractCourseName(
      event.categories as { [p: string]: string } | string[] | string | undefined,
      summary
    );

    if (!courseMap.has(courseName)) {
      courseMap.set(courseName, { name: courseName, assignments: [] });
    }
    courseMap.get(courseName)!.assignments.push({ title: summary, dueDate });
  }

  const courses = Array.from(courseMap.values());

  return NextResponse.json({ courses });
}
