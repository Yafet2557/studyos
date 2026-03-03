"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteNote, updateNote } from "@/lib/actions/note";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type SerializedNote = {
  id: string;
  title: string;
  content: string;
  userId: string;
  courseId: string | null;
  assignmentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export function NoteDetailClient({ note }: { note: SerializedNote }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [saving, setSaving] = useState(false);

  async function handleRename() {
    setSaving(true);
    const fd = new FormData();
    fd.append("title", title);
    await updateNote(note.id, fd);
    setSaving(false);
    setRenameOpen(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={async () => {
              if (window.confirm("Delete this note? This cannot be undone.")) {
                await deleteNote(note.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rename-title">Title</Label>
              <Input
                id="rename-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleRename} disabled={saving || !title.trim()}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
