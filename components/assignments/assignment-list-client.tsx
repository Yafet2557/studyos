"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignmentForm } from "./assignment-form";
import { IcsImportDialog } from "./ics-import-dialog";
import { Plus, Download } from "lucide-react";
import type { Course } from "@/app/generated/prisma/client";

export function AssignmentListClient({ courses }: { courses: Course[] }) {
  const [open, setOpen] = useState(false);
  const [icsOpen, setIcsOpen] = useState(false);
  const router = useRouter();

  function handleIcsClose() {
    setIcsOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-normal tracking-tight">Assignments</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIcsOpen(true)}>
            <Download className="h-4 w-4 mr-1" />
            Import from Econestoga
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Assignment
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Assignment</DialogTitle>
          </DialogHeader>
          <AssignmentForm courses={courses} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <IcsImportDialog open={icsOpen} onClose={handleIcsClose} />
    </>
  );
}
