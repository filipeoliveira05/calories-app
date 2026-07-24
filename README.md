# Calories & Protein Tracker

Personal single-user app replacing a years-old Excel workflow for tracking calories/protein per meal, body weight, and weekly averages.

Live at: https://calories-app-sigma-three.vercel.app (password-gated)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS 4
- Prisma ORM (`prisma-client` generator, `engineType = "client"` — engine-less, runs entirely through `@prisma/adapter-pg`) against Supabase Postgres
- Password gate via `src/proxy.ts` (this Next.js's middleware) + HMAC-signed cookie, no full auth system
- PWA manifest for "Add to Home Screen" (no service worker — install is manual via browser menu, not an automatic prompt)
- Deployed on Vercel, auto-deploys on push to `main`

## Data model

- `Food` — personal nutrition database (calories/protein per 100g), source of truth, added manually (no CSV import)
- `MealEntry` — logged meals; snapshots the food's calorie/protein values at creation time so later edits to a `Food` don't retroactively change historical logs
- `WeightEntry` — one per day, weekly average computed in `src/lib/weeks.ts`
- `Goals` — single-row daily calorie/protein targets, plus an optional personal-info profile (sex, birth date, height, activity level, weight goal type/rate, protein target) used to derive suggested goals via Mifflin-St Jeor (`src/lib/nutritionGoals.ts`)

## Local development

```bash
npm install     # triggers `prisma generate` via postinstall
npm run dev
```

Requires a `.env` with `DATABASE_URL`, `DIRECT_URL` (both Supabase connection strings — see below), and `APP_PASSWORD`.

### Supabase connection strings

- `DATABASE_URL` — transaction pooler (port 6543, `pgbouncer=true&sslmode=no-verify`). Used by the app at runtime via the `pg` adapter. `sslmode=no-verify` is required because Node's `pg` driver treats `sslmode=require` as strict `verify-full` and rejects Supabase's cert chain.
- `DIRECT_URL` — session/direct connection (port 5432, `sslmode=require`). Used by `prisma.config.ts` for CLI/migrations — the transaction pooler hangs (not errors) on the schema engine's connectivity check.

## Deployment (Vercel)

Env vars (`DATABASE_URL`, `DIRECT_URL`, `APP_PASSWORD`) are set in the Vercel project dashboard, not committed. `build` runs `prisma generate && next build` explicitly (not just `postinstall`) because Vercel can skip `npm install`/`postinstall` on cached builds when `package-lock.json` is unchanged.

## Status

All core pages (Foods, Today, Weight, Stats, Settings) are built and deployed, now with a custom warm, dark-first visual identity (see `CLAUDE.md` for the design system). Since the initial build: Today's log is grouped by meal type (5 types, breakfast to dinner), weight can be logged in 0.05kg increments with weekly averages broken down per day, and Stats charts support a custom date range filter (plus quick presets for last month/3 months/year). Foods now have categories (filterable on the Foods page, grouped in Today's food picker) and can optionally be logged by unit instead of grams (e.g. "2 yogurts"), for foods that are naturally counted rather than weighed. Today's logged entries support inline editing (grams or quantity, tap to edit). Settings now has a Personal Info profile that calculates suggested daily calorie/protein goals from body stats and activity level (one "Save & calculate goals" action, previewing maintenance/calorie-goal/protein-target), alongside the original manual goal-entry card for setting numbers directly. Remaining candidate: a service worker for automatic Android install prompts (currently manual "Add to Home Screen" only, which is fine for now).
