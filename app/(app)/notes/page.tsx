import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { NoteListClient } from "@/components/notes/note-list-client";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { FileText } from "lucide-react";

export default async function NotesPage() {
  const userId = await getUser();

  const [notes, courses] = await Promise.all([
    prisma.note.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.course.findMany({
      where: { userId, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <NoteListClient courses={courses} />

      {notes.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No notes yet"
          description="Create your first note to start capturing knowledge."
        />
      )}

      {notes.length > 0 && (
        <div className="grid gap-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="flex items-center justify-between rounded-xl shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:translate-y-[-1px] px-5 py-4 transition-all duration-300 bg-card border border-border/50"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{note.title}</p>
                {note.course && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {note.course.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                {note.course && (
                  <Badge variant="secondary" className="hidden sm:flex">
                    {note.course.name}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
