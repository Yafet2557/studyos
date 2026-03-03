import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/ai/client";
import { dailyPlanPrompt } from "@/lib/ai/prompts";
import type { Assignment } from "@/app/generated/prisma/client";

function buildContext(assignments: Assignment[]): string {
  const now = new Date();
  const lines: string[] = [];

  const overdue = assignments.filter((a) => a.dueDate && a.dueDate < now);
  const upcoming = assignments.filter((a) => a.dueDate && a.dueDate >= now);
  const noDue = assignments.filter((a) => !a.dueDate);

  if (overdue.length > 0) {
    lines.push("OVERDUE:");
    overdue.forEach((a) => {
      const days = Math.floor((now.getTime() - a.dueDate!.getTime()) / (1000 * 60 * 60 * 24));
      lines.push(`- ${a.title} (${days}d overdue, ${a.priority} priority, ${a.status})`);
    });
  }

  if (upcoming.length > 0) {
    lines.push("\nUPCOMING:");
    upcoming.forEach((a) => {
      const days = Math.ceil((a.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      lines.push(`- ${a.title} (due in ${days}d, ${a.priority} priority, ${a.status})`);
    });
  }

  if (noDue.length > 0) {
    lines.push("\nNO DUE DATE:");
    noDue.forEach((a) => {
      lines.push(`- ${a.title} (${a.priority} priority, ${a.status})`);
    });
  }

  return lines.join("\n") || "No active assignments.";
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let force = false;
  try {
    const body = await req.json();
    force = body?.force === true;
  } catch {
    // no body is fine
  }

  // Check for a cached plan from today
  if (!force) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const cached = await prisma.aiOutput.findFirst({
      where: { userId, outputType: "PLAN", createdAt: { gte: todayStart } },
      orderBy: { createdAt: "desc" },
    });

    if (cached) {
      return NextResponse.json({ plan: cached.content, cached: true });
    }
  }

  const assignments = await prisma.assignment.findMany({
    where: {
      userId,
      status: { not: "DONE" },
    },
    orderBy: { dueDate: "asc" },
  });

  const context = buildContext(assignments);

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    messages: [{ role: "user", content: dailyPlanPrompt(context) }],
  });

  const plan = message.content[0].type === "text" ? message.content[0].text : "";

  await prisma.aiOutput.create({
    data: {
      userId,
      entityType: "ASSIGNMENT",
      outputType: "PLAN",
      content: plan,
      modelUsed: "claude-haiku-4-5",
    },
  });

  return NextResponse.json({ plan, cached: false });
}
