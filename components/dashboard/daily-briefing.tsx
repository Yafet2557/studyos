"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";

export function DailyBriefing({ cachedPlan }: { cachedPlan: string | null }) {
  const [plan, setPlan] = useState<string | null>(cachedPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(force = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Something went wrong";
        setError(msg);
        toast.error(msg);
        return;
      }
      setPlan(data.plan);
      toast.success("Plan generated");
    } catch {
      setError("Network error. Please try again.");
      toast.error("Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card h-fit overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Daily Briefing</span>
        </div>
        {plan && (
          <button
            onClick={() => generate(true)}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            title="Regenerate"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {plan ? (
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{plan}</p>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">No plan yet</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate a personalised study plan based on your assignments.
              </p>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button size="sm" onClick={() => generate(false)} disabled={loading} className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {loading ? "Generating..." : "Generate Plan"}
            </Button>
          </div>
        )}
        {plan && error && <p className="text-xs text-destructive mt-3">{error}</p>}
      </div>
    </div>
  );
}
