"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteForm } from "./note-form";
import { Plus } from "lucide-react";
import type { Course } from "@/app/generated/prisma/client";

export function NoteListClient({ courses }: { courses: Course[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-normal tracking-tight">Notes</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Note
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Note</DialogTitle>
          </DialogHeader>
          <NoteForm courses={courses} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
