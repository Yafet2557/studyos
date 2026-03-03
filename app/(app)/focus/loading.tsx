export default function FocusLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page heading */}
      <div className="h-9 w-24 bg-muted rounded" />

      {/* Timer circle placeholder */}
      <div className="flex justify-center">
        <div className="h-56 w-56 bg-muted rounded-full" />
      </div>

      {/* Controls row */}
      <div className="flex justify-center gap-3">
        <div className="h-10 w-24 bg-muted rounded" />
        <div className="h-10 w-24 bg-muted rounded" />
      </div>

      {/* Session history list */}
      <div className="space-y-3">
        <div className="h-5 w-36 bg-muted rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card px-4 py-3 h-14 flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-3 w-1/4 bg-muted rounded" />
            </div>
            <div className="h-4 w-12 bg-muted rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
