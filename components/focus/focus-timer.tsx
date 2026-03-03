"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import type { Course } from "@/app/generated/prisma/client";
import type { SerializedAssignment, SerializedFocusSession } from "@/lib/types";

type Phase = "setup" | "active" | "paused" | "done";

type FocusTimerProps = {
  courses: Course[];
  assignments: SerializedAssignment[];
  onSessionComplete: (session: SerializedFocusSession) => void;
};

const DURATION_PRESETS = [15, 25, 50] as const;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FocusTimer({ courses, assignments, onSessionComplete }: FocusTimerProps) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [durationMins, setDurationMins] = useState<number>(25);
  const [customMins, setCustomMins] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [label, setLabel] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [remainingSecs, setRemainingSecs] = useState<number>(0);
  const [totalSecs, setTotalSecs] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [elapsedBeforePause, setElapsedBeforePause] = useState<number>(0);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const effectiveDuration = useCustom
    ? Math.min(120, Math.max(1, parseInt(customMins, 10) || 25))
    : durationMins;

  async function handleStart() {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMins: effectiveDuration,
          courseId: selectedCourseId || undefined,
          assignmentId: selectedAssignmentId || undefined,
          label: label.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to start session:", err.error);
        toast.error("Failed to start session");
        return;
      }

      const data = await res.json();
      const total = effectiveDuration * 60;
      setSessionId(data.session.id);
      setTotalSecs(total);
      setRemainingSecs(total);
      setElapsedBeforePause(0);
      setStartedAt(Date.now());
      setPhase("active");

      intervalRef.current = setInterval(() => {
        setRemainingSecs((prev) => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  }

  // When remaining hits 0, transition to done
  useEffect(() => {
    if (phase === "active" && remainingSecs === 0 && sessionId) {
      setPulse(true);
      const elapsed = totalSecs;
      handleEndSession(elapsed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSecs, phase]);

  function handlePause() {
    clearTimer();
    setElapsedBeforePause((prev) => prev + Math.floor((Date.now() - startedAt) / 1000));
    setPhase("paused");
  }

  function handleResume() {
    setStartedAt(Date.now());
    setPhase("active");

    intervalRef.current = setInterval(() => {
      setRemainingSecs((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleStopRequest() {
    if (phase === "active") {
      clearTimer();
      setElapsedBeforePause((prev) => prev + Math.floor((Date.now() - startedAt) / 1000));
    }
    setStopDialogOpen(true);
  }

  async function handleEndSession(actualSecs: number) {
    if (!sessionId || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/focus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, actualSecs }),
      });

      if (!res.ok) {
        console.error("Failed to end session");
        toast.error("Failed to save session");
        return;
      }

      const data = await res.json();
      setPhase("done");
      setStopDialogOpen(false);
      toast.success("Focus session complete!");
      onSessionComplete(data.session);
    } finally {
      setSubmitting(false);
    }
  }

  function handleConfirmStop() {
    const elapsed = elapsedBeforePause;
    handleEndSession(elapsed);
  }

  function handleReset() {
    clearTimer();
    setPhase("setup");
    setSessionId(null);
    setRemainingSecs(0);
    setTotalSecs(0);
    setElapsedBeforePause(0);
    setPulse(false);
    setLabel("");
    setSelectedCourseId("");
    setSelectedAssignmentId("");
  }

  const progressPct = totalSecs > 0 ? ((totalSecs - remainingSecs) / totalSecs) * 100 : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  // Filtered assignments based on selected course
  const filteredAssignments = selectedCourseId
    ? assignments.filter((a) => a.courseId === selectedCourseId)
    : assignments;

  if (phase === "done") {
    const actualMins = Math.floor((totalSecs - remainingSecs) / 60);
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div
          className={`w-48 h-48 rounded-full border-4 border-primary flex items-center justify-center transition-all ${pulse ? "scale-105 shadow-lg shadow-primary/20" : ""}`}
        >
          <div className="text-center">
            <p className="text-5xl font-mono font-medium text-primary">
              {actualMins}
            </p>
            <p className="text-sm text-muted-foreground mt-1">minutes</p>
          </div>
        </div>
        <p className="text-lg font-medium">Session complete</p>
        {label && <p className="text-sm text-muted-foreground">{label}</p>}
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          New session
        </Button>
      </div>
    );
  }

  if (phase === "setup") {
    return (
      <div className="space-y-6">
        {/* Duration presets */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Duration</Label>
          <div className="flex gap-2 flex-wrap">
            {DURATION_PRESETS.map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setDurationMins(mins);
                  setUseCustom(false);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  !useCustom && durationMins === mins
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:bg-accent"
                }`}
              >
                {mins} min
              </button>
            ))}
            <button
              onClick={() => setUseCustom(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                useCustom
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:bg-accent"
              }`}
            >
              Custom
            </button>
          </div>
          {useCustom && (
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                min={1}
                max={120}
                placeholder="Minutes (1–120)"
                value={customMins}
                onChange={(e) => setCustomMins(e.target.value)}
                className="w-40 font-mono"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          )}
        </div>

        {/* Optional label */}
        <div className="space-y-2">
          <Label htmlFor="focus-label" className="text-sm font-medium">
            Label <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="focus-label"
            placeholder="e.g. Lab 3 Report"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Optional course link */}
        {courses.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Course <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Select
              value={selectedCourseId}
              onValueChange={(val) => {
                setSelectedCourseId(val === "none" ? "" : val);
                setSelectedAssignmentId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code ? `${c.code} — ${c.name}` : c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Optional assignment link */}
        {filteredAssignments.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Assignment <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Select
              value={selectedAssignmentId}
              onValueChange={(val) => setSelectedAssignmentId(val === "none" ? "" : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {filteredAssignments.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          size="lg"
          onClick={handleStart}
          disabled={submitting || (useCustom && (!customMins || parseInt(customMins, 10) < 1))}
          className="w-full gap-2"
        >
          <Play className="h-4 w-4" />
          {submitting ? "Starting..." : `Start ${effectiveDuration} min session`}
        </Button>
      </div>
    );
  }

  // Active / Paused
  return (
    <>
      <div className="flex flex-col items-center gap-8">
        {/* Circular countdown */}
        <div className="relative w-52 h-52">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-border"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="text-primary transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-medium tabular-nums">
              {formatTime(remainingSecs)}
            </span>
            {label && (
              <span className="text-xs text-muted-foreground mt-2 max-w-[120px] text-center truncate">
                {label}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {phase === "active" ? (
            <Button variant="outline" size="lg" onClick={handlePause} className="gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          ) : (
            <Button size="lg" onClick={handleResume} className="gap-2">
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}
          <Button
            variant="ghost"
            size="lg"
            onClick={handleStopRequest}
            className="gap-2 text-muted-foreground hover:text-destructive"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
        </div>

        {phase === "paused" && (
          <p className="text-sm text-muted-foreground">Paused — timer stopped</p>
        )}
      </div>

      {/* Stop confirmation dialog */}
      <Dialog open={stopDialogOpen} onOpenChange={(open) => {
        if (!open && phase === "paused") {
          // Re-check: if they cancel while paused, remain paused
          setStopDialogOpen(false);
        } else {
          setStopDialogOpen(open);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End session early?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Your elapsed time will be saved. The session will be marked as complete.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStopDialogOpen(false);
                if (phase === "paused") {
                  // Remain paused — do nothing
                }
              }}
            >
              Keep going
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmStop}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "End session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
