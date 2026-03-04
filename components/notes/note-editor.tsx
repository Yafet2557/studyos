"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { updateNote } from "@/lib/actions/note";
import { NoteAiPanel } from "./note-ai-panel";
import { Eye, EyeOff } from "lucide-react";
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

export function NoteEditor({ note }: { note: SerializedNote }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [editingTitle, setEditingTitle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  async function saveContent() {
    setSaving(true);
    const fd = new FormData();
    fd.append("content", content);
    await updateNote(note.id, fd);
    setSaving(false);
  }

  async function saveTitle() {
    setEditingTitle(false);
    if (title === note.title) return;
    const fd = new FormData();
    fd.append("title", title);
    await updateNote(note.id, fd);
  }

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between gap-4">
        {editingTitle ? (
          <input
            ref={titleRef}
            className="text-2xl font-semibold bg-transparent border-b border-border focus:outline-none flex-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") titleRef.current?.blur();
            }}
            autoFocus
          />
        ) : (
          <h1
            className="text-2xl font-semibold cursor-pointer hover:opacity-70 flex-1"
            onClick={() => setEditingTitle(true)}
          >
            {title}
          </h1>
        )}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPreview((p) => !p)}
            className="text-muted-foreground"
          >
            {preview ? <EyeOff className="h-4 w-4 mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5" />}
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" onClick={saveContent} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="prose prose-sm dark:prose-invert max-w-none overflow-auto rounded-2xl border border-input bg-muted/30 px-4 py-3 text-sm min-h-[400px]">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview.</p>
          )}
        </div>
      ) : (
        <textarea
          className="w-full flex-1 min-h-[400px] resize-none rounded-2xl border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={saveContent}
          placeholder="Write your notes here..."
        />
      )}

      <NoteAiPanel noteId={note.id} />
    </div>
  );
}
