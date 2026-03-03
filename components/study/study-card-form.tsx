"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createStudyCard, updateStudyCard } from "@/lib/actions/study-card";
import type { SerializedStudyCard } from "@/lib/types";
import type { Course } from "@/app/generated/prisma/client";

type ActionState = { error?: string } | undefined;

type StudyCardFormProps = {
  card?: SerializedStudyCard;
  courses: Course[];
  onClose: () => void;
};

export function StudyCardForm({ card, courses, onClose }: StudyCardFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      if (card) {
        return updateStudyCard(card.id, formData);
      }
      return createStudyCard(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="front">Front *</Label>
        <Textarea
          id="front"
          name="front"
          defaultValue={card?.front}
          placeholder="Question or prompt..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="back">Back *</Label>
        <Textarea
          id="back"
          name="back"
          defaultValue={card?.back}
          placeholder="Answer..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Course</Label>
        <Select name="courseId" defaultValue={card?.courseId ?? "none"}>
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
          {isPending ? "Saving..." : card ? "Save Changes" : "Create Card"}
        </Button>
      </div>
    </form>
  );
}
