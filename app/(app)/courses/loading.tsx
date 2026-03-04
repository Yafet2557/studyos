import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header row: heading + button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32 rounded-2xl" />
        <Skeleton className="h-9 w-28 rounded-2xl" />
      </div>

      {/* Course card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-5 space-y-3 h-36">
            <Skeleton className="h-5 w-3/4 rounded-2xl" />
            <Skeleton className="h-4 w-1/3 rounded-2xl" />
            <Skeleton className="h-4 w-1/2 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
