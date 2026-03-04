"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="animate-scale-in flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 p-5 shadow-[var(--shadow-sm)] mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-serif font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition-opacity hover:opacity-90"
          style={{ background: "var(--gradient-primary)" }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
