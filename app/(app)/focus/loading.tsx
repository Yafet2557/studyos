import { Skeleton } from "@/components/ui/skeleton";

export default function FocusLoading() {
  return (
    <div className="space-y-8">
      {/* Page heading */}
      <Skeleton className="h-9 w-24 rounded-2xl" />

      {/* Timer circle placeholder */}
      <div className="flex justify-center">
        <Skeleton className="h-56 w-56 rounded-full" />
      </div>

      {/* Controls row */}
      <div className="flex justify-center gap-3">
        <Skeleton className="h-10 w-24 rounded-2xl" />
        <Skeleton className="h-10 w-24 rounded-2xl" />
      </div>

      {/* Session history list */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-36 rounded-2xl" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card px-4 py-3 h-14 flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/2 rounded-2xl" />
              <Skeleton className="h-3 w-1/4 rounded-2xl" />
            </div>
            <Skeleton className="h-4 w-12 rounded-2xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
