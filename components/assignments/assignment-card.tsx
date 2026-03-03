"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { Trash2 } from "lucide-react";
import { deleteAssignment } from "@/lib/actions/assignment";
import type { Assignment, Course, Priority } from "@/app/generated/prisma/client";

const PRIORITY_LABELS: Record<Priority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  HIGH: "text-red-500",
  MEDIUM: "text-amber-500",
  LOW: "text-slate-400",
};

function formatDueDate(dueDate: Date | null): { label: string; urgent: boolean } {
  if (!dueDate) return { label: "No due date", urgent: false };

  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  const days = Math.floor(Math.abs(hours) / 24);

  if (hours < 0) {
    return {
      label: days === 0 ? "Due today (overdue)" : `Overdue by ${days} day${days === 1 ? "" : "s"}`,
      urgent: true,
    };
  }
  if (hours < 24) return { label: "Due today", urgent: true };
  if (hours < 48) return { label: "Due tomorrow", urgent: true };
  return { label: `Due in ${days} days`, urgent: false };
}

type AssignmentWithCourse = Assignment & { course: Course | null };

export function AssignmentCard({ assignment }: { assignment: AssignmentWithCourse }) {
  const [deleting, setDeleting] = useState(false);
  const { label, urgent } = formatDueDate(assignment.dueDate);

  async function handleDelete() {
    setDeleting(true);
    await deleteAssignment(assignment.id);
  }

  return (
    <div className="relative group">
      <Link href={`/assignments/${assignment.id}`}>
        <Card className={`hover:border-border/80 hover:bg-card/80 transition-colors cursor-pointer ${deleting ? "opacity-50 pointer-events-none" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 pr-6">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{assignment.title}</p>
                {assignment.course && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: assignment.course.color ?? "#64748b" }}
                    />
                    <span className="text-sm text-muted-foreground truncate">
                      {assignment.course.name}
                      {assignment.course.code ? ` · ${assignment.course.code}` : ""}
                    </span>
                  </div>
                )}
              </div>
              <StatusBadge status={assignment.status} />
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${urgent ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
              <span className={`text-xs font-medium ${PRIORITY_COLORS[assignment.priority]}`}>
                {PRIORITY_LABELS[assignment.priority]}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={handleDelete}
        disabled={deleting}
      >
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}
