import { AlertCircle, Clock, Timer, Flame } from "lucide-react";

export function DashboardStats({
  overdueCount,
  dueThisWeekCount,
  weeklyFocusHours,
  studyStreakDays,
}: {
  overdueCount: number;
  dueThisWeekCount: number;
  weeklyFocusHours: number;
  studyStreakDays: number;
}) {
  const focusLabel = weeklyFocusHours.toFixed(1) + "h";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
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

      <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
        <Timer
          className={`h-5 w-5 flex-shrink-0 ${
            weeklyFocusHours > 0 ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <div>
          <p
            className={`text-2xl font-mono font-semibold leading-none ${
              weeklyFocusHours > 0 ? "text-primary" : "text-foreground"
            }`}
          >
            {focusLabel}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 tracking-widest uppercase">
            Hours studied
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
        <Flame
          className={`h-5 w-5 flex-shrink-0 ${
            studyStreakDays > 0 ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <div>
          <p
            className={`text-2xl font-mono font-semibold leading-none ${
              studyStreakDays > 0 ? "text-primary" : "text-foreground"
            }`}
          >
            {studyStreakDays}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 tracking-widest uppercase">
            Day streak
          </p>
        </div>
      </div>
    </div>
  );
}
