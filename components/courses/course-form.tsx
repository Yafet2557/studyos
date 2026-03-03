"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCourse, updateCourse } from "@/lib/actions/course";

const PRESET_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#64748b",
];

const DEFAULT_COLOR = PRESET_COLORS[0];

type CourseFormProps = {
  course?: {
    id: string;
    name: string;
    code: string | null;
    color: string | null;
  };
  onClose: () => void;
};

type FormState = { error?: string } | undefined;

export function CourseForm({ course, onClose }: CourseFormProps) {
  const [selectedColor, setSelectedColor] = useState<string>(
    course?.color ?? DEFAULT_COLOR
  );

  const submitCountRef = useRef(0);

  const action = course
    ? (_prev: FormState, formData: FormData) => {
        submitCountRef.current += 1;
        return updateCourse(course.id, formData);
      }
    : (_prev: FormState, formData: FormData) => {
        submitCountRef.current += 1;
        return createCourse(formData);
      };

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    action,
    undefined
  );

  useEffect(() => {
    if (submitCountRef.current === 0) return;
    if (isPending) return;
    if (state?.error) {
      toast.error(state.error);
    } else if (course) {
      // createCourse redirects on success so toast only fires for updates
      toast.success("Course updated");
      onClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isPending]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Course name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Algorithms & Data Structures"
          defaultValue={course?.name ?? ""}
          required
          disabled={isPending}
          aria-invalid={!!state?.error}
        />
        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">
          Course code{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="code"
          name="code"
          placeholder="e.g. CS301"
          defaultValue={course?.code ?? ""}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Color</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((color) => {
            const isSelected = selectedColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                disabled={isPending}
                className="relative size-7 rounded-full transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:scale-110 disabled:pointer-events-none"
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <CheckIcon
                    className="absolute inset-0 m-auto size-3.5 text-white drop-shadow"
                    strokeWidth={3}
                  />
                )}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="color" value={selectedColor} />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : course ? "Save changes" : "Create course"}
        </Button>
      </div>
    </form>
  );
}
