export default function StudyLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page heading */}
      <div className="h-9 w-24 bg-muted rounded" />

      {/* Stats row */}
      <div className="flex items-center gap-6">
        <div className="h-16 w-36 bg-muted rounded-xl" />
        <div className="h-16 w-36 bg-muted rounded-xl" />
        <div className="h-16 w-36 bg-muted rounded-xl" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3 h-40">
            <div className="h-5 w-3/4 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-8 w-28 bg-muted rounded mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
