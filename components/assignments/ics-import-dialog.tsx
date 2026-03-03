"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AssignmentPreview = {
  title: string;
  dueDate: string | null;
};

type CoursePreview = {
  name: string;
  assignments: AssignmentPreview[];
};

type Step = "input" | "preview" | "done";

export function IcsImportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [courses, setCourses] = useState<CoursePreview[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCounts, setImportedCounts] = useState<{
    courses: number;
    assignments: number;
  } | null>(null);

  function handleOpenChange(val: boolean) {
    if (!val) {
      handleClose();
    }
  }

  function handleClose() {
    setStep("input");
    setUrl("");
    setCourses([]);
    setError(null);
    setImportedCounts(null);
    onClose();
  }

  async function handlePreview() {
    setError(null);
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/import/ics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setCourses(data.courses);
      setStep("preview");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleImport() {
    setError(null);
    setLoadingImport(true);
    try {
      const res = await fetch("/api/import/ics/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setImportedCounts(data.created);
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoadingImport(false);
    }
  }

  const totalAssignments = courses.reduce(
    (sum, c) => sum + c.assignments.length,
    0
  );

  function formatDueDate(iso: string | null): string {
    if (!iso) return "No due date";
    const d = new Date(iso);
    return d.toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import from Econestoga</DialogTitle>
        </DialogHeader>

        {step === "input" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ics-url">Calendar ICS URL</Label>
              <Input
                id="ics-url"
                placeholder="Paste your Econestoga calendar ICS URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loadingPreview}
              />
              <p className="text-xs text-muted-foreground">
                Find this in Econestoga &rarr; Calendar &rarr; Subscribe to Calendar
              </p>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end">
              <Button
                onClick={handlePreview}
                disabled={loadingPreview || url.trim().length === 0}
              >
                {loadingPreview ? "Fetching..." : "Preview Import"}
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Found {totalAssignments} assignment{totalAssignments !== 1 ? "s" : ""} across {courses.length} course{courses.length !== 1 ? "s" : ""}
            </p>

            <div className="max-h-64 overflow-y-auto rounded-md border p-3 flex flex-col gap-4">
              {courses.map((course) => (
                <div key={course.name}>
                  <p className="text-sm font-semibold mb-1">{course.name}</p>
                  <ul className="flex flex-col gap-0.5">
                    {course.assignments.map((a, i) => (
                      <li key={i} className="flex justify-between text-xs text-muted-foreground">
                        <span className="truncate pr-2">{a.title}</span>
                        <span className="shrink-0">{formatDueDate(a.dueDate)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("input");
                  setError(null);
                }}
                disabled={loadingImport}
              >
                Back
              </Button>
              <Button onClick={handleImport} disabled={loadingImport}>
                {loadingImport ? "Importing..." : "Import All"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && importedCounts && (
          <div className="flex flex-col gap-4">
            <p className="text-sm">
              Imported {importedCounts.assignments} assignment{importedCounts.assignments !== 1 ? "s" : ""} from {importedCounts.courses} course{importedCounts.courses !== 1 ? "s" : ""}
            </p>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
