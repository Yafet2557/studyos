import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/ai/client";
import { subtaskBreakdownPrompt } from "@/lib/ai/prompts";

const ALLOWED_MEDIA_TYPES = ["application/pdf", "text/plain", "text/markdown"] as const;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: { assignmentId?: unknown; file?: { data?: unknown; mediaType?: unknown } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { assignmentId, file } = body;

  if (!assignmentId || typeof assignmentId !== "string") {
    return NextResponse.json({ error: "assignmentId required" }, { status: 400 });
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment || assignment.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Validate file if provided
  let validatedFile: { data: string; mediaType: string } | null = null;
  if (file) {
    if (typeof file.data !== "string" || typeof file.mediaType !== "string") {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }
    if (!ALLOWED_MEDIA_TYPES.includes(file.mediaType as typeof ALLOWED_MEDIA_TYPES[number])) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    // base64 length * 0.75 ≈ raw bytes
    if (file.data.length * 0.75 > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }
    validatedFile = { data: file.data, mediaType: file.mediaType };
  }

  // Build message content
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userContent: any[] = [];
  if (validatedFile) {
    userContent.push({
      type: "document",
      source: {
        type: "base64",
        media_type: validatedFile.mediaType,
        data: validatedFile.data,
      },
    });
  }
  userContent.push({
    type: "text",
    text: subtaskBreakdownPrompt(assignment.title, assignment.description, !!validatedFile),
  });

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: userContent }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const text = raw.replace(/```(?:json)?\n?/g, "").trim();

  let subtaskTitles: string[];
  try {
    subtaskTitles = z.array(z.string()).parse(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  await prisma.aiOutput.create({
    data: {
      userId,
      assignmentId,
      entityType: "ASSIGNMENT",
      outputType: "SUBTASKS",
      content: subtaskTitles,
      modelUsed: "claude-haiku-4-5",
    },
  });

  // Atomic delete + replace
  await prisma.$transaction([
    prisma.subtask.deleteMany({ where: { assignmentId, userId } }),
    prisma.subtask.createMany({
      data: subtaskTitles.map((title, i) => ({
        title,
        assignmentId,
        userId,
        position: i,
      })),
    }),
  ]);

  return NextResponse.json({ subtasks: subtaskTitles });
}
