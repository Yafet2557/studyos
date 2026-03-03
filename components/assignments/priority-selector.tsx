"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAssignmentPriority } from "@/lib/actions/assignment";
import type { Priority } from "@/app/generated/prisma/client";

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export function PrioritySelector({
  assignmentId,
  currentPriority,
}: {
  assignmentId: string;
  currentPriority: Priority;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={currentPriority}
      disabled={isPending}
      onValueChange={(value) => {
        startTransition(() => {
          updateAssignmentPriority(assignmentId, value as Priority);
        });
      }}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRIORITY_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
