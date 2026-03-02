# StudyOS

AI-powered student productivity app. Tracks assignments, organizes notes, and uses Claude to help plan your day.

## Stack

| Layer | Tech |
|---|---|
| Frontend + API | Next.js 15 App Router, TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL (Docker locally, Railway/Neon in prod) |
| Auth | NextAuth.js v5 (credentials + JWT) |
| AI | Claude API — `claude-haiku-4-5` (fast), `claude-sonnet-4-6` (planning) |
| Styling | Tailwind CSS |
| Testing | Jest + React Testing Library |
| CI/CD | GitHub Actions |

## Dev Commands

```bash
# Start local PostgreSQL via Docker
docker compose up -d

# Run migrations after schema changes
npx prisma migrate dev --name <description>

# Generate Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Start dev server
npm run dev

# Run tests
npm test

# Lint
npm run lint
```

## Project Structure

```
app/
  (auth)/login          Login page
  (auth)/signup         Signup page
  (app)/dashboard       Daily AI planner — first screen after login
  (app)/courses         Course list + course detail
  (app)/assignments     All assignments (urgency-sorted) + assignment detail
  (app)/notes           Notes list + markdown editor with AI panel
  api/auth/[...nextauth] NextAuth handler
  api/ai/breakdown      Subtask generation (haiku)
  api/ai/summarize      Note summarization (haiku)
  api/ai/questions      Study question generation (haiku)
  api/ai/plan           Daily planner (sonnet)
lib/
  prisma.ts             Prisma client singleton — import this everywhere, not @prisma/client directly
  auth.ts               NextAuth config
  ai/prompts.ts         All Claude prompt templates — edit here, not in routes
  utils/urgency.ts      Assignment urgency scoring (drives the sort order)
prisma/
  schema.prisma         Database schema — source of truth
  migrations/           Never edit these by hand
```

## Key Conventions

- **Prisma client**: always import from `@/lib/prisma`, never from `@prisma/client` directly — prevents connection pool exhaustion in Next.js dev mode
- **Auth check in API routes**: every route that touches DB data must verify `session.user.id === resource.userId` before returning data
- **AI routes**: all Claude calls live in `app/api/ai/` — never call the Anthropic SDK from a client component
- **Prompts**: all prompt strings live in `lib/ai/prompts.ts` — when tuning prompts, edit here only
- **Validation**: use Zod schemas for all form inputs and API request bodies
- **Status enum**: `TODO | IN_PROGRESS | REVIEW | DONE` — match Prisma schema exactly
- **Priority enum**: `LOW | MEDIUM | HIGH` — match Prisma schema exactly

## Prisma Notes (v6)

Prisma 6 uses `prisma.config.ts` instead of putting the DB URL in `schema.prisma`. The config reads `DATABASE_URL` from `.env`. After any schema change:
1. `npx prisma migrate dev --name <what-changed>`
2. `npx prisma generate` (usually runs automatically with migrate)

The generated client outputs to `app/generated/prisma` (set in schema.prisma generator block).

## Environment Variables

```bash
# .env (local only — never commit)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/studyos"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."
```

## Data Model Summary

- `User` → has many `Course`, `Assignment`, `Note`, `Subtask`, `AiOutput`
- `Course` → groups assignments and notes
- `Assignment` → has status/priority/dueDate, belongs to a course (optional)
- `Subtask` → belongs to an assignment, has position for ordering
- `Note` → linked to a course OR assignment (both optional — orphaned notes are allowed)
- `AiOutput` — cached Claude responses keyed to an entity + output type

## AI Output Caching

Every Claude call checks `AiOutput` first. If a cached row exists for that entity + output type, serve it. Otherwise call Claude, store the result, return it. This avoids redundant API calls.

For MVP: always regenerate on button click and upsert. Add content-hash invalidation later if stale results become a problem.

## Urgency Scoring (lib/utils/urgency.ts)

Assignments are sorted by urgency score:
- Overdue items float to the top (large offset)
- Score = `priority_weight * 100 / max(hoursUntilDue, 1)`
- Priority weights: HIGH=3, MEDIUM=2, LOW=1
- Null due dates go in a separate "No deadline" bucket at the bottom

## Testing Focus

Keep tests focused — don't test everything, test what matters:
- Pure logic: `urgency.ts` score function
- Component rendering: `AssignmentCard` shows correct status badge
- API behavior: breakdown route serves cache when `AiOutput` exists
