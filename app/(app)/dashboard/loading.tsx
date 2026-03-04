import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <Skeleton className="h-9 w-40 rounded-2xl" />

      {/* Stats row — 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="rounded-2xl h-24" />
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily briefing placeholder */}
        <div className="rounded-2xl border bg-card p-5 space-y-3">
          <Skeleton className="h-5 w-32 rounded-2xl" />
          <Skeleton className="h-4 w-full rounded-2xl" />
          <Skeleton className="h-4 w-5/6 rounded-2xl" />
          <Skeleton className="h-4 w-4/6 rounded-2xl" />
          <Skeleton className="h-4 w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4 rounded-2xl" />
        </div>

        {/* Right column: upcoming assignments + recent notes */}
        <div className="space-y-6">
          {/* Upcoming assignments */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <Skeleton className="h-5 w-44 rounded-2xl" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-2xl" />
            ))}
          </div>

          {/* Recent notes */}
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <Skeleton className="h-5 w-28 rounded-2xl" />
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
