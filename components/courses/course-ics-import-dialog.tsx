"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Assignment = { title: string; dueDate: string | null };
type Step = "url" | "preview" | "done";

export function CourseIcsImportDialog({
  courseId,
  open,
  onClose,
}: {
  courseId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("url");
  const [url, setUrl] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCount, setCreatedCount] = useState(0);

  function reset() {
    setStep("url");
    setUrl("");
    setAssignments([]);
    setLoading(false);
    setError(null);
    setCreatedCount(0);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFetch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import/ics/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setAssignments(data.assignments);
      setStep("preview");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/import/ics/course/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, assignments }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setCreatedCount(data.created);
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Assignments from ICS</DialogTitle>
        </DialogHeader>

        {step === "url" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste your course calendar ICS feed URL from D2L Brightspace.
            </p>
            <Input
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && url.trim()) handleFetch(); }}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleFetch} disabled={!url.trim() || loading}>
                {loading ? "Fetching..." : "Fetch Assignments"}
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}.
              Duplicates will be skipped automatically.
            </p>
            <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
              {assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No upcoming assignments found in this feed.
                </p>
              ) : (
                assignments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="flex-1 truncate">{a.title}</span>
                    {a.dueDate && (
                      <span className="text-muted-foreground ml-4 whitespace-nowrap">
                        {new Date(a.dueDate).toLocaleDateString("en-CA", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("url")}>Back</Button>
              <Button
                onClick={handleConfirm}
                disabled={loading || assignments.length === 0}
              >
                {loading
                  ? "Importing..."
                  : `Import ${assignments.length} assignment${assignments.length !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {createdCount === 0
                ? "All assignments already exist — nothing new was added."
                : `${createdCount} assignment${createdCount !== 1 ? "s" : ""} imported successfully.`}
            </p>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
