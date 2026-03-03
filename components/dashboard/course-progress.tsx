"use client";

type CourseProgressItem = {
  id: string;
  name: string;
  color: string;
  total: number;
  completed: number;
};

export function CourseProgress({ courses }: { courses: CourseProgressItem[] }) {
  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border/60">
          <span className="text-sm font-semibold tracking-tight">Course Progress</span>
        </div>
        <p className="text-sm text-muted-foreground px-5 py-4">No courses yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60">
        <span className="text-sm font-semibold tracking-tight">Course Progress</span>
      </div>

      <div className="divide-y divide-border/40">
        {courses.map((course) => {
          const pct = course.total === 0 ? 0 : Math.round((course.completed / course.total) * 100);

          return (
            <div key={course.id} className="px-5 py-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: course.color || "#64748b" }}
                  />
                  <span className="text-sm font-medium truncate">{course.name}</span>
                </div>
                {course.total === 0 ? (
                  <span className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                    No assignments
                  </span>
                ) : (
                  <span className="text-xs font-mono text-muted-foreground ml-4 whitespace-nowrap">
                    {course.completed}/{course.total} done
                  </span>
                )}
              </div>

              {course.total > 0 && (
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
