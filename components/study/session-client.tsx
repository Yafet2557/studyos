"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SerializedStudyCard, SerializedStudySession } from "@/lib/types";

type Phase = "front" | "back" | "done";

const RATINGS = [
  { label: "Again", quality: 0, hint: "< 1 day", className: "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200" },
  { label: "Hard", quality: 2, hint: "1 day", className: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200" },
  { label: "Good", quality: 3, hint: "Few days", className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200" },
  { label: "Easy", quality: 5, hint: "1+ week", className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200" },
] as const;

type SessionClientProps = {
  session: SerializedStudySession;
  cards: SerializedStudyCard[];
};

export function SessionClient({ session, cards }: SessionClientProps) {
  const [phase, setPhase] = useState<Phase>("front");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsStudied, setCardsStudied] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const endSession = useCallback(
    async (studied: number, correct: number) => {
      const durationSecs = Math.round((Date.now() - startedAt.current) / 1000);
      await fetch("/api/study/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          durationSecs,
          cardsStudied: studied,
          correctCount: correct,
        }),
      });
    },
    [session.id]
  );

  async function handleRate(quality: number) {
    if (submitting || !currentCard) return;
    setSubmitting(true);

    try {
      await fetch("/api/study/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          cardId: currentCard.id,
          quality,
        }),
      });

      const newStudied = cardsStudied + 1;
      const newCorrect = quality >= 3 ? correctCount + 1 : correctCount;
      setCardsStudied(newStudied);
      setCorrectCount(newCorrect);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= cards.length) {
        await endSession(newStudied, newCorrect);
        setPhase("done");
      } else {
        setCurrentIndex(nextIndex);
        setPhase("front");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Done phase
  if (phase === "done") {
    const durationSecs = Math.round((Date.now() - startedAt.current) / 1000);
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;
    const pct = cardsStudied > 0 ? Math.round((correctCount / cardsStudied) * 100) : 0;

    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-[0_0_30px_oklch(0.6_0.2_150/0.3)] animate-scale-in">
          <Check className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-serif font-normal tracking-tight">
          Session Complete
        </h2>
        <div className="grid grid-cols-3 gap-8 text-center">
          <div className="rounded-2xl bg-muted/30 p-4">
            <p className="text-2xl font-mono font-medium">{cardsStudied}</p>
            <p className="text-sm text-muted-foreground">Cards</p>
          </div>
          <div className="rounded-2xl bg-muted/30 p-4">
            <p className="text-2xl font-mono font-medium">{pct}%</p>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-2xl bg-muted/30 p-4">
            <p className="text-2xl font-mono font-medium">
              {mins > 0 ? `${mins}m ` : ""}{secs}s
            </p>
            <p className="text-sm text-muted-foreground">Duration</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/study">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Study
          </Link>
        </Button>
      </div>
    );
  }

  // Active study phase
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Card {currentIndex + 1} of {cards.length}
          </span>
          <span className="font-mono">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card */}
      <Card className="min-h-[320px] flex flex-col rounded-3xl shadow-[var(--shadow-lg)]">
        <CardContent className="flex-1 flex flex-col justify-center p-8">
          {phase === "front" ? (
            <div className="text-center space-y-4">
              <p className="text-lg font-medium leading-relaxed">
                {currentCard.front}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {currentCard.front}
                </p>
              </div>
              <hr className="border-border/60" />
              <div className="text-center">
                <p className="text-lg leading-relaxed">
                  {currentCard.back}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      {phase === "front" ? (
        <div className="flex justify-center">
          <Button size="lg" onClick={() => setPhase("back")}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Show Answer
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-center text-muted-foreground">
            How well did you know this?
          </p>
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.quality}
                disabled={submitting}
                onClick={() => handleRate(r.quality)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border transition-all duration-200 disabled:opacity-50 hover:scale-[1.03] active:scale-[0.97] ${r.className}`}
              >
                <span className="text-sm font-medium">{r.label}</span>
                <span className="text-xs opacity-70">{r.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
