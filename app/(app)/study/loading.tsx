import { Skeleton } from "@/components/ui/skeleton";

export default function StudyLoading() {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <Skeleton className="h-9 w-24 rounded-2xl" />

      {/* Stats row */}
      <div className="flex items-center gap-6">
        <Skeleton className="h-16 w-36 rounded-2xl" />
        <Skeleton className="h-16 w-36 rounded-2xl" />
        <Skeleton className="h-16 w-36 rounded-2xl" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-5 space-y-3 h-40">
            <Skeleton className="h-5 w-3/4 rounded-2xl" />
            <Skeleton className="h-4 w-full rounded-2xl" />
            <Skeleton className="h-4 w-5/6 rounded-2xl" />
            <Skeleton className="h-8 w-28 rounded-2xl mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
