import { AlertCircle, Clock } from "lucide-react";

export function DashboardStats({
  overdueCount,
  dueThisWeekCount,
}: {
  overdueCount: number;
  dueThisWeekCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-xs animate-fade-up">
      <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
        <AlertCircle
          className={`h-5 w-5 flex-shrink-0 ${
            overdueCount > 0 ? "text-destructive" : "text-muted-foreground"
          }`}
        />
        <div>
          <p
            className={`text-2xl font-mono font-semibold leading-none ${
              overdueCount > 0 ? "text-destructive" : "text-foreground"
            }`}
          >
            {overdueCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 tracking-widest uppercase">
            Overdue
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
        <Clock
          className={`h-5 w-5 flex-shrink-0 ${
            dueThisWeekCount > 0 ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <div>
          <p
            className={`text-2xl font-mono font-semibold leading-none ${
              dueThisWeekCount > 0 ? "text-primary" : "text-foreground"
            }`}
          >
            {dueThisWeekCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 tracking-widest uppercase">
            This week
          </p>
        </div>
      </div>
    </div>
  );
}
