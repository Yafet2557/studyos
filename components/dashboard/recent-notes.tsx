import Link from "next/link";
import type { Note } from "@/app/generated/prisma/client";

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export function RecentNotes({ notes }: { notes: Note[] }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/60">
        <span className="text-sm font-semibold tracking-tight">Recent Notes</span>
      </div>

      <div>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-4">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors border-b border-border/40 last:border-b-0"
            >
              <p className="text-sm font-medium truncate flex-1">{note.title}</p>
              <span className="text-xs font-mono text-muted-foreground ml-4 whitespace-nowrap">
                {relativeTime(note.updatedAt)}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
