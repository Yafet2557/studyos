"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudyCardForm } from "./study-card-form";
import { deleteStudyCard } from "@/lib/actions/study-card";
import type { SerializedStudyCard } from "@/lib/types";
import type { Course } from "@/app/generated/prisma/client";

type NoteOption = { id: string; title: string };

type StudyCardListProps = {
  cards: SerializedStudyCard[];
  courses: Course[];
  notes: NoteOption[];
};

export function StudyCardList({ cards, courses, notes }: StudyCardListProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<SerializedStudyCard | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!selectedNoteId) return;
    setGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: selectedNoteId }),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.error ?? "Failed to generate cards";
        setGenerateError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Flashcards generated");
      router.refresh();
    } catch {
      setGenerateError("Network error");
      toast.error("Failed to generate flashcards");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(cardId: string) {
    await deleteStudyCard(cardId);
    toast.success("Card deleted");
    router.refresh();
  }

  function formatNextReview(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Due now";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium">Your Cards</h2>
          <span className="text-sm text-muted-foreground">({cards.length})</span>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Card
        </Button>
      </div>

      {/* Generate from Note */}
      {notes.length > 0 && (
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium">Generate from Note</label>
            <Select value={selectedNoteId} onValueChange={setSelectedNoteId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a note..." />
              </SelectTrigger>
              <SelectContent>
                {notes.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={!selectedNoteId || generating}
            onClick={handleGenerate}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      )}
      {generateError && (
        <p className="text-sm text-red-500">{generateError}</p>
      )}

      {/* Card Grid */}
      {cards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No study cards yet</p>
          <p className="text-sm mt-1">
            Create cards manually or generate them from your notes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((card) => (
            <div key={card.id} className="relative group hover:translate-y-[-1px] hover:shadow-[var(--shadow-md)] transition-all duration-300">
              <Card className="hover:border-border/80 transition-colors">
                <CardContent className="p-4">
                  <p className="font-medium text-sm line-clamp-2">
                    {card.front}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {card.back}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {formatNextReview(card.nextReviewAt)}
                    </span>
                    {card.courseId && (
                      <span className="text-xs text-muted-foreground">
                        {courses.find((c) => c.id === card.courseId)?.name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setEditingCard(card)}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDelete(card.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Study Card</DialogTitle>
          </DialogHeader>
          <StudyCardForm
            courses={courses}
            onClose={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Study Card</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <StudyCardForm
              card={editingCard}
              courses={courses}
              onClose={() => setEditingCard(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
