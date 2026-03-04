import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentsLoading() {
  return (
    <div className="space-y-6">
      {/* Header row: heading + buttons */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40 rounded-2xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-44 rounded-2xl" />
          <Skeleton className="h-9 w-36 rounded-2xl" />
        </div>
      </div>

      {/* Section label */}
      <Skeleton className="h-4 w-24 rounded-2xl" />

      {/* Assignment row list */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card px-4 py-3 h-14 flex items-center gap-4">
            <Skeleton className="h-5 w-5 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3 rounded-2xl" />
              <Skeleton className="h-3 w-1/3 rounded-2xl" />
            </div>
            <Skeleton className="h-5 w-16 rounded-2xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
