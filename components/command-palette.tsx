"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileText,
  Brain,
  Timer,
  Plus,
  Moon,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommandItem {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  action: () => void;
  disabled?: boolean;
  hint?: string;
}

interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommandPalette() {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  // Close and navigate
  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ---------------------------------------------------------------------------
  // Command definitions
  // ---------------------------------------------------------------------------

  const groups: CommandGroup[] = [
    {
      heading: "Navigation",
      items: [
        {
          id: "nav-dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          shortcut: "G D",
          action: () => go("/dashboard"),
        },
        {
          id: "nav-courses",
          label: "Courses",
          icon: BookOpen,
          shortcut: "G C",
          action: () => go("/courses"),
        },
        {
          id: "nav-assignments",
          label: "Assignments",
          icon: ClipboardList,
          shortcut: "G A",
          action: () => go("/assignments"),
        },
        {
          id: "nav-notes",
          label: "Notes",
          icon: FileText,
          shortcut: "G N",
          action: () => go("/notes"),
        },
        {
          id: "nav-study",
          label: "Study",
          icon: Brain,
          shortcut: "G S",
          action: () => go("/study"),
        },
        {
          id: "nav-focus",
          label: "Focus",
          icon: Timer,
          shortcut: "G F",
          action: () => go("/focus"),
        },
      ],
    },
    {
      heading: "Quick Actions",
      items: [
        {
          id: "action-new-assignment",
          label: "New Assignment",
          icon: Plus,
          action: () => go("/assignments/new"),
        },
        {
          id: "action-new-note",
          label: "New Note",
          icon: Plus,
          action: () => go("/notes/new"),
        },
        {
          id: "action-new-study-card",
          label: "New Study Card",
          icon: Plus,
          action: () => go("/study/new"),
        },
        {
          id: "action-start-focus",
          label: "Start Focus Session",
          icon: Timer,
          action: () => go("/focus"),
        },
      ],
    },
    {
      heading: "Theme",
      items: [
        {
          id: "theme-dark",
          label: "Toggle Dark Mode",
          icon: Moon,
          action: () => {
            toggleTheme();
            setOpen(false);
          },
        },
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!open) return null;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-start justify-center"
      onClick={() => setOpen(false)}
    >
      {/* Dialog — stop clicks from bubbling to overlay */}
      <div
        className="glass w-full max-w-lg mt-[20vh] rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="flex flex-col"
          // cmdk exposes a loop prop for keyboard wraparound
          loop
        >
          {/* Search input */}
          <div className="flex items-center border-b border-border/60">
            <Command.Input
              autoFocus
              placeholder="Type a command or search..."
              className="w-full px-5 py-4 text-lg bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
            />
          </div>

          {/* Results list */}
          <Command.List className="max-h-80 overflow-y-auto py-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {groups.map((group) => (
              <Command.Group
                key={group.heading}
                heading={group.heading}
                className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide"
              >
                {group.items.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.label}
                    disabled={item.disabled}
                    onSelect={item.action}
                    className="rounded-xl mx-2 px-3 py-2.5 flex items-center gap-3 text-sm cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary aria-disabled:opacity-40 aria-disabled:cursor-not-allowed transition-colors"
                  >
                    {/* Icon */}
                    <item.icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />

                    {/* Label */}
                    <span className="flex-1">{item.label}</span>

                    {/* Shortcut hint or "coming soon" badge */}
                    {item.hint ? (
                      <span className="text-xs text-muted-foreground/60 italic">
                        {item.hint}
                      </span>
                    ) : item.shortcut ? (
                      <span className="flex items-center gap-1">
                        {item.shortcut.split(" ").map((key) => (
                          <kbd
                            key={key}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded-md border border-primary/20 bg-primary/10 text-primary/70 leading-none"
                          >
                            {key}
                          </kbd>
                        ))}
                      </span>
                    ) : null}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          {/* Footer hint */}
          <div className="border-t border-border/60 px-4 py-2 flex items-center gap-3 text-[11px] text-muted-foreground/70">
            <span>
              <kbd className="font-mono">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono">↵</kbd> select
            </span>
            <span>
              <kbd className="font-mono">Esc</kbd> close
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
