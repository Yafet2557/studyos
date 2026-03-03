export default function NotesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header row: heading + button */}
      <div className="flex items-center justify-between">
        <div className="h-9 w-24 bg-muted rounded" />
        <div className="h-9 w-28 bg-muted rounded" />
      </div>

      {/* Note row list */}
      <div className="grid gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 h-14"
          >
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-3 w-1/4 bg-muted rounded" />
            </div>
            <div className="h-5 w-20 bg-muted rounded ml-4 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
