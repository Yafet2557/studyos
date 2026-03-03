export default function AssignmentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header row: heading + buttons */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-40 bg-muted rounded" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-44 bg-muted rounded" />
          <div className="h-9 w-36 bg-muted rounded" />
        </div>
      </div>

      {/* Section label */}
      <div className="h-4 w-24 bg-muted rounded" />

      {/* Assignment row list */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card px-4 py-3 h-14 flex items-center gap-4">
            <div className="h-5 w-5 bg-muted rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-3 w-1/3 bg-muted rounded" />
            </div>
            <div className="h-5 w-16 bg-muted rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
