"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type PanelState = {
  summary: string | null;
  questions: string[] | null;
  loadingSummary: boolean;
  loadingQuestions: boolean;
  errorSummary: string | null;
  errorQuestions: string | null;
};

export function NoteAiPanel({ noteId }: { noteId: string }) {
  const [state, setState] = useState<PanelState>({
    summary: null,
    questions: null,
    loadingSummary: false,
    loadingQuestions: false,
    errorSummary: null,
    errorQuestions: null,
  });

  useEffect(() => {
    setState({
      summary: null,
      questions: null,
      loadingSummary: false,
      loadingQuestions: false,
      errorSummary: null,
      errorQuestions: null,
    });
  }, [noteId]);

  async function handleSummarize() {
    setState((s) => ({ ...s, loadingSummary: true, errorSummary: null }));
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState((s) => ({ ...s, errorSummary: data.error ?? "Something went wrong" }));
        return;
      }
      setState((s) => ({ ...s, summary: data.summary }));
    } catch {
      setState((s) => ({ ...s, errorSummary: "Network error. Please try again." }));
    } finally {
      setState((s) => ({ ...s, loadingSummary: false }));
    }
  }

  async function handleQuestions() {
    setState((s) => ({ ...s, loadingQuestions: true, errorQuestions: null }));
    try {
      const res = await fetch("/api/ai/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState((s) => ({ ...s, errorQuestions: data.error ?? "Something went wrong" }));
        return;
      }
      setState((s) => ({ ...s, questions: data.questions }));
    } catch {
      setState((s) => ({ ...s, errorQuestions: "Network error. Please try again." }));
    } finally {
      setState((s) => ({ ...s, loadingQuestions: false }));
    }
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">AI Tools</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSummarize}
          disabled={state.loadingSummary}
        >
          {state.loadingSummary ? "Summarizing..." : "Summarize"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleQuestions}
          disabled={state.loadingQuestions}
        >
          {state.loadingQuestions ? "Generating..." : "Generate Study Questions"}
        </Button>
      </div>

      {state.errorSummary && (
        <p className="text-xs text-red-500">{state.errorSummary}</p>
      )}

      {state.summary && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Summary
          </p>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{state.summary}</p>
        </div>
      )}

      {state.errorQuestions && (
        <p className="text-xs text-red-500">{state.errorQuestions}</p>
      )}

      {state.questions && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Study Questions
          </p>
          <ol className="space-y-1.5 list-decimal list-inside">
            {state.questions.map((q, i) => (
              <li key={i} className="text-sm">
                {q}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
