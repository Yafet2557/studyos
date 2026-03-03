"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudyCardList } from "./study-card-list";
import type { SerializedStudyCard, SerializedStudySession } from "@/lib/types";
import type { Course } from "@/app/generated/prisma/client";

type NoteOption = { id: string; title: string };

type StudyPageClientProps = {
  dueCount: number;
  totalCards: number;
  sessions: SerializedStudySession[];
  cards: SerializedStudyCard[];
  courses: Course[];
  notes: NoteOption[];
};

export function StudyPageClient({
  dueCount,
  totalCards,
  sessions,
  cards,
  courses,
  notes,
}: StudyPageClientProps) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  async function handleStartReview() {
    setStarting(true);
    try {
      const res = await fetch("/api/study/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.session) {
        router.push(`/study/session?sessionId=${data.session.id}`);
      }
    } finally {
      setStarting(false);
    }
  }

  function formatDuration(secs: number | null): string {
    if (!secs) return "--";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  }

  return (
    <div className="space-y-8">
      {/* Stats + Start Button */}
      <div className="flex items-center gap-6 animate-fade-up fade-up-1">
        <Card className="flex-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-mono font-medium">{dueCount}</p>
              <p className="text-sm text-muted-foreground">Cards due</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-lg font-mono font-medium">{totalCards}</span>
            </div>
            <div>
              <p className="text-2xl font-mono font-medium">{totalCards}</p>
              <p className="text-sm text-muted-foreground">Total cards</p>
            </div>
          </CardContent>
        </Card>
        <Button
          size="lg"
          disabled={dueCount === 0 || starting}
          onClick={handleStartReview}
          className="h-auto py-4 px-6"
        >
          {starting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-2" />
          )}
          {starting ? "Starting..." : "Start Review"}
        </Button>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <section className="space-y-3 animate-fade-up fade-up-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/60 bg-card"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {s.cardsStudied} cards studied
                  </span>
                  {s.cardsStudied > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({Math.round((s.correctCount / s.cardsStudied) * 100)}%
                      correct)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-mono">
                    {formatDuration(s.durationSecs)}
                  </span>
                  <span>{formatRelativeDate(s.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Card Management */}
      <section className="animate-fade-up fade-up-3">
        <StudyCardList cards={cards} courses={courses} notes={notes} />
      </section>
    </div>
  );
}
