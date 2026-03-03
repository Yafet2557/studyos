import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { CourseDetailClient } from "@/components/courses/course-detail-client";
import { Badge } from "@/components/ui/badge";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const userId = await getUser();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      assignments: {
        include: { course: true },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!course || course.userId !== userId) notFound();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: course.color ?? "#64748b" }}
            />
            <h1 className="text-3xl font-serif font-normal tracking-tight">{course.name}</h1>
            {!course.isActive && (
              <Badge variant="outline" className="text-muted-foreground">
                Archived
              </Badge>
            )}
          </div>
          {course.code && (
            <p className="text-muted-foreground mt-1 ml-7">{course.code}</p>
          )}
        </div>
        <CourseDetailClient course={course} />
      </div>

      {/* Assignments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Assignments ({course.assignments.length})
          </h2>
        </div>

        {course.assignments.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">
            No assignments for this course yet.
          </p>
        ) : (
          <div className="space-y-2">
            {course.assignments.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
