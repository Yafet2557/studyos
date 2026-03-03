import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-utils";
import { NoteEditor } from "@/components/notes/note-editor";
import { NoteDetailClient } from "@/components/notes/note-detail-client";
import { Badge } from "@/components/ui/badge";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const userId = await getUser();

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { course: true },
  });

  if (!note || note.userId !== userId) notFound();

  const serialized = {
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {note.course && (
            <Badge variant="secondary">{note.course.name}</Badge>
          )}
        </div>
        <NoteDetailClient note={serialized} />
      </div>

      <NoteEditor note={serialized} />
    </div>
  );
}
