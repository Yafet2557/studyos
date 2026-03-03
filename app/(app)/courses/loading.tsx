export default function CoursesLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header row: heading + button */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-32 bg-muted rounded" />
        <div className="h-9 w-28 bg-muted rounded" />
      </div>

      {/* Course card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3 h-36">
            <div className="h-5 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/3 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
