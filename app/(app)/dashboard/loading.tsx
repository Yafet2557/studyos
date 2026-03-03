export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page heading */}
      <div className="h-9 w-40 bg-muted rounded" />

      {/* Stats row — 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-muted h-24" />
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily briefing placeholder */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-4/6 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>

        {/* Right column: upcoming assignments + recent notes */}
        <div className="space-y-6">
          {/* Upcoming assignments */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="h-5 w-44 bg-muted rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-muted rounded" />
            ))}
          </div>

          {/* Recent notes */}
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <div className="h-5 w-28 bg-muted rounded" />
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
