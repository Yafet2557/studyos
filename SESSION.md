# StudyOS Session Summary

## Current Phase: Phase 6 (Tests + CI/CD) — NOT STARTED

## What's Done

### Phase 1 — Foundation ✅
- Next.js 15, Prisma 6 (driver adapter via `@prisma/adapter-pg`), PostgreSQL (Docker)
- NextAuth v5 beta.30, signup/login pages, sidebar layout with shadcn

### Phase 2 — Course + Assignment CRUD ✅
- `lib/actions/course.ts`, `lib/actions/assignment.ts`, `lib/actions/subtask.ts`
- `lib/validations/` — Zod v4 schemas
- `lib/auth-utils.ts` — `getUser()` helper
- `lib/utils/urgency.ts` — urgency scoring + `sortByUrgency()`
- `lib/types.ts` — `SerializedAssignment` + `serializeAssignment()` (Decimal → string)
- `/courses`, `/courses/[courseId]`, `/assignments`, `/assignments/[assignmentId]`
- Subtask checklist with add/toggle/delete

### Phase 3 — AI Breakdown ✅
- `app/api/ai/breakdown/route.ts` — auth, ownership, optional PDF doc block, Claude haiku, `prisma.$transaction` for atomic subtask replace
- `components/assignments/breakdown-button.tsx` — file input (PDF/txt/md, 5MB), base64 via FileReader
- `lib/ai/prompts.ts` — `subtaskBreakdownPrompt(title, description?, hasDocument?)`

### Phase 3.5 — ICS Import (Assignments Tab) ✅
- `app/api/import/ics/route.ts` — preview: parse ICS, group by CATEGORIES field (regex fallback), filter < 30 days old
- `app/api/import/ics/confirm/route.ts` — write courses + assignments, dedup by title+courseId
- `components/assignments/ics-import-dialog.tsx` — 3-step dialog: URL → preview → success
- `components/assignments/assignment-list-client.tsx` — "Import from Econestoga" button
- **Fix**: `next.config.ts` has `serverExternalPackages: ["node-ical"]` — required to prevent BigInt crash

### Phase 3.6 — Course-Specific ICS Import ✅
- `app/api/import/ics/course/route.ts` — preview for known courseId, no course name extraction
- `app/api/import/ics/course/confirm/route.ts` — write assignments to known course, dedup
- `components/courses/course-ics-import-dialog.tsx` — 3-step dialog
- `components/courses/course-detail-client.tsx` — "Import ICS" button added next to 3-dot menu

### Phase 4 — Notes ✅
- `lib/validations/note.ts`, `lib/actions/note.ts` — CRUD with ownership checks
- `app/api/ai/summarize/route.ts` — haiku, stores AiOutput (outputType: SUMMARY)
- `app/api/ai/questions/route.ts` — haiku, parses JSON array, stores (outputType: QUESTIONS)
- `app/(app)/notes/page.tsx`, `app/(app)/notes/[noteId]/page.tsx`
- `components/notes/note-form.tsx`, `note-list-client.tsx`, `note-editor.tsx`, `note-ai-panel.tsx`, `note-detail-client.tsx`
- Note editor: full-width textarea + Eye/EyeOff toggle for preview — NOT side-by-side

### Phase 5 — Dashboard ✅
- `app/api/ai/plan/route.ts` — caches one plan/day in AiOutput (outputType: PLAN), `force: true` bypasses cache, uses `claude-haiku-4-5`
- `app/(app)/dashboard/page.tsx` — 5 parallel Prisma queries
- `components/dashboard/daily-briefing.tsx` — shows cached plan or "Generate Plan" button; ↻ forces regenerate
- `components/dashboard/dashboard-stats.tsx` — 2 stat cards: Overdue (red), Due this week (amber)
- `components/dashboard/upcoming-assignments.tsx` — top 5 non-done by due date
- `components/dashboard/recent-notes.tsx` — last 4 notes, relative timestamps

### Security Fixes ✅
- IDOR on courseId: `verifyCourseOwnership()` in `lib/actions/assignment.ts`
- Null-clearing for dueDate/estimatedHours on update
- Runtime Zod validation for status/priority enums
- `prisma.$transaction` for atomic subtask delete+createMany
- File validation: 5MB limit + media type allowlist in breakdown route
- `req.json()` in try/catch across all API routes

### UI Fixes ✅
- `assignment-card.tsx` — hover trash icon (sibling of Link, no stopPropagation needed)
- `subtask-list.tsx` — uses `SerializedSubtask[]` not `Subtask[]`

## Pending

### Phase 6 — Tests + CI/CD + Docker
- Jest tests:
  - `lib/utils/urgency.ts` — pure function, easy
  - `components/assignments/assignment-card.tsx` — status badge renders correctly
  - `app/api/ai/breakdown/route.ts` — serves cached AiOutput, skips Claude call
- GitHub Actions: `.github/workflows/ci.yml` — install, lint, tsc, test
- Dockerfile for app container (docker-compose already exists for postgres)

### Phase 7 — Polish
- Mobile-responsive nav
- Error boundaries on client components
- Empty states with CTAs
- Loading skeletons on dashboard

## Key Conventions (repeat these to next session)
- Prisma client: `import { prisma } from "@/lib/prisma"` — never `@prisma/client` directly
- Generated client at `@/app/generated/prisma/client`
- API route auth: `const session = await auth(); if (!session?.user?.id) return 401`
- Server action/page auth: `const userId = await getUser()` from `@/lib/auth-utils`
- Zod v4: `.issues[0].message` not `.errors[0].message`
- `SerializedAssignment` / `SerializedSubtask` for server→client boundary
- `tsc --noEmit` was clean at end of this session
