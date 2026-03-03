import { Badge } from "@/components/ui/badge";
import type { Status } from "@/app/generated/prisma/client";

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  TODO: { label: "To Do", className: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  REVIEW: { label: "Review", className: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  DONE: { label: "Done", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_CONFIG[status];
  return <Badge className={className}>{label}</Badge>;
}
