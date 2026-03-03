"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createNote } from "@/lib/actions/note";
import type { Course } from "@/app/generated/prisma/client";

type ActionState = { error?: string } | undefined;

type NoteFormProps = {
  courses: Course[];
  onClose: () => void;
};

export function NoteForm({ courses, onClose }: NoteFormProps) {
  const submitCountRef = useRef(0);

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      submitCountRef.current += 1;
      return createNote(formData);
    },
    undefined
  );

  useEffect(() => {
    if (submitCountRef.current === 0) return;
    if (isPending) return;
    if (state?.error) {
      toast.error(state.error);
    }
    // createNote redirects on success — no toast needed here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isPending]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Lecture 5 Notes"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Course</Label>
        <Select name="courseId" defaultValue="none">
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

      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Note"}
        </Button>
      </div>
    </form>
  );
}
