"use client";

import { useState } from "react";
import { PlusIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseCard } from "./course-card";
import { CourseForm } from "./course-form";

type CourseWithCount = {
  id: string;
  name: string;
  code: string | null;
  color: string | null;
  isActive: boolean;
  _count: { assignments: number };
};

type EditTarget = {
  id: string;
  name: string;
  code: string | null;
  color: string | null;
};

type CourseListProps = {
  courses: CourseWithCount[];
};

export function CourseList({ courses }: CourseListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  const activeCourses = courses.filter((c) => c.isActive);
  const archivedCourses = courses.filter((c) => !c.isActive);

  function openCreate() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function openEdit(course: CourseWithCount) {
    setEditTarget({
      id: course.id,
      name: course.name,
      code: course.code,
      color: course.color,
    });
    setDialogOpen(true);
  }

  function handleClose() {
    setDialogOpen(false);
    setEditTarget(null);
  }

  const isEmpty = courses.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-normal tracking-tight">Courses</h1>
        <Button size="sm" onClick={openCreate}>
          <PlusIcon />
          New course
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg font-medium">No courses yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Add your courses to start tracking assignments and notes in one place.
          </p>
          <Button variant="outline" size="sm" onClick={openCreate} className="mt-1">
            <PlusIcon />
            Add your first course
          </Button>
        </div>
      ) : (
        <>
          {activeCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCourses.map((course) => (
                <CourseCard key={course.id} course={course} onEdit={openEdit} />
              ))}
            </div>
          )}

          {archivedCourses.length > 0 && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setArchivedExpanded((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <ChevronDownIcon
                  className={`size-4 transition-transform duration-200 ${
                    archivedExpanded ? "rotate-0" : "-rotate-90"
                  }`}
                />
                Archived ({archivedCourses.length})
              </button>

              {archivedExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {archivedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onEdit={openEdit} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit course" : "New course"}
            </DialogTitle>
          </DialogHeader>
          <CourseForm course={editTarget ?? undefined} onClose={handleClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
