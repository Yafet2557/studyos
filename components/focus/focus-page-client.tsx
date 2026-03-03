"use client";

import { useState } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FocusTimer } from "./focus-timer";
import type { Course } from "@/app/generated/prisma/client";
import type { SerializedAssignment, SerializedFocusSession } from "@/lib/types";

type FocusPageClientProps = {
  courses: Course[];
  assignments: SerializedAssignment[];
  recentSessions: SerializedFocusSession[];
};

function formatDuration(secs: number | null, plannedMins: number): string {
  if (secs === null) return `${plannedMins}m planned`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function getTodayStats(sessions: SerializedFocusSession[]): { count: number; totalMins: number } {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySessions = sessions.filter(
    (s) => s.completedAt && new Date(s.completedAt) >= todayStart
  );

  const totalSecs = todaySessions.reduce((acc, s) => acc + (s.actualSecs ?? 0), 0);
  return {
    count: todaySessions.length,
    totalMins: Math.floor(totalSecs / 60),
  };
}

export function FocusPageClient({
  courses,
  assignments,
  recentSessions: initialSessions,
}: FocusPageClientProps) {
  const [recentSessions, setRecentSessions] = useState<SerializedFocusSession[]>(initialSessions);

  function handleSessionComplete(session: SerializedFocusSession) {
    setRecentSessions((prev) => [session, ...prev].slice(0, 10));
  }

  const { count: todayCount, totalMins: todayMins } = getTodayStats(recentSessions);

  return (
    <div className="space-y-8">
      {/* Today stats */}
      <div className="flex gap-4 animate-fade-up fade-up-1">
        <Card className="flex-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-mono font-medium">{todayMins}</p>
              <p className="text-sm text-muted-foreground">Minutes focused today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-mono font-medium">{todayCount}</p>
              <p className="text-sm text-muted-foreground">Sessions today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer */}
      <Card className="animate-fade-up fade-up-2">
        <CardContent className="p-6 sm:p-8">
          <FocusTimer
            courses={courses}
            assignments={assignments}
            onSessionComplete={handleSessionComplete}
          />
        </CardContent>
      </Card>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <section className="space-y-3 animate-fade-up fade-up-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent sessions
          </h2>
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/60 bg-card"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    {s.label ? (
                      <p className="text-sm font-medium">{s.label}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Focus session</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-mono">
                    {formatDuration(s.actualSecs, s.durationMins)}
                  </span>
                  <span>{s.completedAt ? formatRelativeDate(s.completedAt) : "In progress"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
