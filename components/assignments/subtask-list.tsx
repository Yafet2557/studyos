"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createSubtask, toggleSubtask, deleteSubtask } from "@/lib/actions/subtask";
import { Trash2 } from "lucide-react";
import type { SerializedSubtask } from "@/lib/types";

type ActionState = { error?: string } | undefined;

export function SubtaskList({
  subtasks,
  assignmentId,
}: {
  subtasks: SerializedSubtask[];
  assignmentId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_, formData) => {
      const result = await createSubtask(formData);
      if (!result?.error) formRef.current?.reset();
      return result;
    },
    undefined
  );

  const done = subtasks.filter((s) => s.isDone).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Subtasks</h3>
        {subtasks.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {done}/{subtasks.length} done
          </span>
        )}
      </div>

      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-3 group">
            <form
              action={async () => {
                await toggleSubtask(subtask.id);
              }}
            >
              <Checkbox
                id={subtask.id}
                defaultChecked={subtask.isDone}
                onClick={(e) => {
                  e.currentTarget.form?.requestSubmit();
                }}
              />
            </form>
            <label
              htmlFor={subtask.id}
              className={`flex-1 text-sm cursor-pointer ${
                subtask.isDone ? "line-through text-muted-foreground" : ""
              }`}
            >
              {subtask.title}
            </label>
            <form
              action={async () => {
                await deleteSubtask(subtask.id);
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </form>
          </div>
        ))}
      </div>

      <form ref={formRef} action={formAction} className="flex gap-2">
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <Input
          name="title"
          placeholder="Add a subtask..."
          className="h-8 text-sm"
          disabled={isPending}
        />
        <Button type="submit" size="sm" disabled={isPending}>
          Add
        </Button>
      </form>
      {state?.error && (
        <p className="text-xs text-red-500">{state.error}</p>
      )}
    </div>
  );
}
