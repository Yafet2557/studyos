import { Skeleton } from "@/components/ui/skeleton";

export default function NotesLoading() {
  return (
    <div className="space-y-6">
      {/* Header row: heading + button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-24 rounded-2xl" />
        <Skeleton className="h-9 w-28 rounded-2xl" />
      </div>

      {/* Note row list */}
      <div className="grid gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border bg-card px-4 py-3 h-14"
          >
            <div className="flex-1 space-y-1.5 min-w-0">
              <Skeleton className="h-4 w-1/2 rounded-2xl" />
              <Skeleton className="h-3 w-1/4 rounded-2xl" />
            </div>
            <Skeleton className="h-5 w-20 rounded-2xl ml-4 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
