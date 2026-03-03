"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CourseForm } from "./course-form";
import { CourseIcsImportDialog } from "./course-ics-import-dialog";
import { deleteCourse, toggleCourseActive } from "@/lib/actions/course";
import { MoreHorizontal, Pencil, Archive, Trash2, Download } from "lucide-react";
import type { Course } from "@/app/generated/prisma/client";

export function CourseDetailClient({ course }: { course: Course }) {
  const [editOpen, setEditOpen] = useState(false);
  const [icsOpen, setIcsOpen] = useState(false);
  const router = useRouter();

  function handleIcsClose() {
    setIcsOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setIcsOpen(true)}>
        <Download className="h-4 w-4 mr-1.5" />
        Import ICS
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await toggleCourseActive(course.id);
            }}
          >
            <Archive className="h-4 w-4 mr-2" />
            {course.isActive ? "Archive" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={async () => {
              if (
                window.confirm(
                  "Delete this course? Assignments will be unlinked but not deleted."
                )
              ) {
                await deleteCourse(course.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>

      <CourseIcsImportDialog
        courseId={course.id}
        open={icsOpen}
        onClose={handleIcsClose}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <CourseForm course={course} onClose={() => setEditOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
