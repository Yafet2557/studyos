# Session Summary

## Current Phase
Phase 1 — Foundation (Days 1–3) — 90% done, blocked on build error

## What's Done
- Next.js 15 (actually 16.1.6) scaffolded
- Docker + Postgres running
- Prisma schema written and migrated (all 6 models, 4 enums)
- `lib/prisma.ts` singleton
- `lib/auth.ts` — NextAuth v5 beta (5.0.0-beta.30) credentials config
- `middleware.ts` — route protection
- `app/api/auth/[...nextauth]/route.ts`
- `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`
- `app/(app)/layout.tsx` with shadcn sidebar
- `components/app-sidebar.tsx`
- shadcn/ui installed with sidebar component

## Build Blocker — Two Issues

### Issue 1: Edge Runtime + Prisma
`middleware.ts` imports `auth` → `lib/auth.ts` → `lib/prisma.ts` → Prisma client
Prisma uses Node.js APIs (`node:path`, `node:url`) that don't run in Edge Runtime.

**Fix needed:** Split auth config into two files:
- `auth.config.ts` — edge-compatible, no Prisma (just session strategy + pages config)
- `lib/auth.ts` — full auth with credentials + Prisma (server only)
- `middleware.ts` should import from `auth.config.ts`, not `lib/auth.ts`

### Issue 2: PrismaClient constructor requires argument
With `provider = "prisma-client"` generator, `new PrismaClient()` needs 1 argument.
Need to check `app/generated/prisma/client.ts` to see what the constructor signature expects.
Current state: `prisma/schema.prisma` uses `provider = "prisma-client"` with `output = "../app/generated/prisma"`
Import in `lib/prisma.ts` is `from '@/app/generated/prisma/client'` (correct — points to specific file not directory)

## Current File States
- `prisma/schema.prisma` — `provider = "prisma-client"`, `output = "../app/generated/prisma"`
- `lib/prisma.ts` — imports from `@/app/generated/prisma/client`, uses `new PrismaClient()` (needs fix)
- `.gitignore` — `/app/generated/prisma` entry is commented out (intentionally tracked)
- `package.json` — build script: `"prisma generate && next build"`
- `next-auth` version: `5.0.0-beta.30`

## Next Session — Do This First
1. Check `app/generated/prisma/client.ts` line 30+ to see PrismaClient constructor signature
2. Fix `lib/prisma.ts` with correct constructor call
3. Create `auth.config.ts` (edge-safe, no Prisma) and update `middleware.ts` to import from it
4. Run `npm run build` and get a clean build
5. Then run `npm run dev`, test signup + login flow end-to-end

## Also Pending
- Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts` — just a warning for now, not breaking
- Need to create stub pages for `/dashboard`, `/courses`, `/assignments`, `/notes` so routes exist
- Need to add `NEXTAUTH_SECRET` to `.env` (currently just a placeholder)

## Key Decisions Made
- Yafet writes feature code, Claude reviews + guides
- Claude does commits, no co-author tags
- Prisma 7 `provider = "prisma-client"` requires explicit output + specific file import
- `@prisma/client` in Prisma 7 is a factory, NOT directly instantiable — must use generated client
- Generated client tracked in git (not gitignored) so Turbopack can resolve it at build time
