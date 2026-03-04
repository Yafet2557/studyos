"use client";

import Link from "next/link";
import { MoreHorizontalIcon, PencilIcon, ArchiveIcon, ArchiveRestoreIcon, Trash2Icon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCourse, toggleCourseActive } from "@/lib/actions/course";
import { cn } from "@/lib/utils";

const DEFAULT_COLOR = "#64748b";

type CourseCardCourse = {
  id: string;
  name: string;
  code: string | null;
  color: string | null;
  isActive: boolean;
  _count: { assignments: number };
};

type CourseCardProps = {
  course: CourseCardCourse;
  onEdit: (course: CourseCardCourse) => void;
};

export function CourseCard({ course, onEdit }: CourseCardProps) {
  const borderColor = course.color ?? DEFAULT_COLOR;

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${course.name}"? This cannot be undone.`
    );
    if (!confirmed) return;
    await deleteCourse(course.id);
  }

  async function handleToggleActive() {
    await toggleCourseActive(course.id);
  }

  return (
    <div className={cn("relative", !course.isActive && "opacity-60")}>
      <Link href={`/courses/${course.id}`} className="block group hover:translate-y-[-2px] hover:shadow-[var(--shadow-md)] transition-all duration-300">
        <Card
          className="gap-0 py-0 overflow-hidden"
        >
          <div className="h-1 rounded-t-2xl" style={{ backgroundColor: borderColor }} />
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 pr-1">
                <p className="font-semibold truncate leading-snug">
                  {course.name}
                </p>
                {course.code && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {course.code}
                  </p>
                )}
              </div>

              {/* Stop click propagation so the dropdown doesn't navigate */}
              <div
                onClick={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground data-[state=open]:bg-accent shrink-0 -mr-1 -mt-0.5"
                      aria-label="Course options"
                    >
                      <MoreHorizontalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onEdit(course)}>
                      <PencilIcon />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleActive}>
                      {course.isActive ? (
                        <>
                          <ArchiveIcon />
                          Archive
                        </>
                      ) : (
                        <>
                          <ArchiveRestoreIcon />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                      <Trash2Icon />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="text-xs">
                {course._count.assignments}{" "}
                {course._count.assignments === 1 ? "assignment" : "assignments"}
              </Badge>
              {!course.isActive && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Archived
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
