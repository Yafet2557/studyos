import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { serializeAssignment } from "@/lib/types";
import { StatusSelector } from "@/components/assignments/status-selector";
import { PrioritySelector } from "@/components/assignments/priority-selector";
import { SubtaskList } from "@/components/assignments/subtask-list";
import { BreakdownButton } from "@/components/assignments/breakdown-button";
import { AssignmentDetailClient } from "@/components/assignments/assignment-detail-client";
import { Badge } from "@/components/ui/badge";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const userId = await getUser();

  const [assignment, courses] = await Promise.all([
    prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: true,
        subtasks: { orderBy: { position: "asc" } },
      },
    }),
    prisma.course.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!assignment || assignment.userId !== userId) notFound();

  const serialized = serializeAssignment(assignment);

  const dueDateStr = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-serif font-normal tracking-tight">{assignment.title}</h1>
          {assignment.course && (
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: assignment.course.color ?? "#64748b" }}
              />
              <span className="text-muted-foreground">
                {assignment.course.name}
                {assignment.course.code ? ` · ${assignment.course.code}` : ""}
              </span>
            </div>
          )}
        </div>
        <AssignmentDetailClient
          assignment={serialized}
          courses={courses}
        />
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <StatusSelector
            assignmentId={assignment.id}
            currentStatus={assignment.status}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Priority</span>
          <PrioritySelector
            assignmentId={assignment.id}
            currentPriority={assignment.priority}
          />
        </div>
        {dueDateStr && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Due</span>
            <Badge variant="outline">{dueDateStr}</Badge>
          </div>
        )}
        {assignment.estimatedHours && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Est.</span>
            <Badge variant="outline">{assignment.estimatedHours.toString()}h</Badge>
          </div>
        )}
      </div>

      {/* Description */}
      {assignment.description && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Description
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {assignment.description}
          </p>
        </div>
      )}

      {/* Subtasks */}
      <div className="space-y-3">
        <BreakdownButton assignmentId={assignment.id} />
        <SubtaskList
          subtasks={serialized.subtasks}
          assignmentId={assignment.id}
        />
      </div>
    </div>
  );
}
