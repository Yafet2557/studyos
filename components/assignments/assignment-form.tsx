"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAssignment, updateAssignment } from "@/lib/actions/assignment";
import type { SerializedAssignment } from "@/lib/types";
import type { Course } from "@/app/generated/prisma/client";

type ActionState = { error?: string } | undefined;

type AssignmentFormProps = {
  assignment?: SerializedAssignment;
  courses: Course[];
  defaultCourseId?: string;
  onClose: () => void;
};

export function AssignmentForm({
  assignment,
  courses,
  defaultCourseId,
  onClose,
}: AssignmentFormProps) {
  const submitCountRef = useRef(0);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      submitCountRef.current += 1;
      if (assignment) {
        return updateAssignment(assignment.id, formData);
      }
      return createAssignment(formData);
    },
    undefined
  );

  useEffect(() => {
    if (submitCountRef.current === 0) return;
    if (isPending) return;
    if (state?.error) {
      toast.error(state.error);
    } else if (assignment) {
      // createAssignment redirects on success so toast only fires for updates
      toast.success("Assignment updated");
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isPending]);

  const defaultDueDate = assignment?.dueDate
    ? assignment.dueDate.split("T")[0]
    : "";

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={assignment?.title}
          placeholder="e.g. Lab 3 Report"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={assignment?.description ?? ""}
          placeholder="Optional details..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={defaultDueDate}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="estimatedHours">Est. Hours</Label>
          <Input
            id="estimatedHours"
            name="estimatedHours"
            type="number"
            min="0"
            max="999.9"
            step="0.5"
            defaultValue={assignment?.estimatedHours?.toString() ?? ""}
            placeholder="e.g. 3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Course</Label>
          <Select
            name="courseId"
            defaultValue={
              assignment?.courseId ?? defaultCourseId ?? "none"
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="No course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No course</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                  {c.code ? ` (${c.code})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select
            name="priority"
            defaultValue={assignment?.priority ?? "MEDIUM"}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : assignment ? "Save Changes" : "Create Assignment"}
        </Button>
      </div>
    </form>
  );
}
