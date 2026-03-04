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
      {/* Overdue */}
      <div className="rounded-2xl bg-card p-5 flex items-center gap-4 shadow-[var(--shadow-sm)]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-red-500/15 to-red-500/5">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
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

      {/* This week */}
      <div className="rounded-2xl bg-card p-5 flex items-center gap-4 shadow-[var(--shadow-sm)]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary/15 to-primary/5">
          <Clock className="h-5 w-5 text-primary" />
        </div>
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

      {/* Hours studied */}
      <div className="rounded-2xl bg-card p-5 flex items-center gap-4 shadow-[var(--shadow-sm)]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5">
          <Timer className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-2xl font-mono font-semibold leading-none text-foreground">
            {focusLabel}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 tracking-widest uppercase">
            Hours studied
          </p>
        </div>
      </div>

      {/* Day streak */}
      <div className="rounded-2xl bg-card p-5 flex items-center gap-4 shadow-[var(--shadow-sm)]">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-amber-500/15 to-amber-500/5">
          <Flame className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <p className="text-2xl font-mono font-semibold leading-none text-foreground">
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
