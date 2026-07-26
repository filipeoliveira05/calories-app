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
- `Recipe` / `RecipeIngredient` — named groups of foods with fixed amounts (grams or unit quantity), logged as a whole from Today; each ingredient snapshots into its own `MealEntry` at log time, same as logging a food directly. A `Food` referenced by a recipe can't be deleted until it's removed from that recipe (`onDelete: Restrict`). `Recipe` can also carry optional `mealTypes` tags, used only for filtering/sorting on the Foods page — they don't restrict which meal type it's actually logged under
- `DayTemplate` / `DayTemplateEntry` — named full-day meal plans (e.g. "Standard Monday"): flat `(Food, mealType, grams/quantity)` rows, the same shape as `MealEntry` but without a nutrition snapshot (snapshotting happens when the template is applied and actual `MealEntry` rows are created). Built from Foods and/or Recipes on the Foods page; applying one to a date adds its rows on top of that date's existing entries. A `Food` referenced by a template can't be deleted until it's removed from that template (`onDelete: Restrict`)

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

All core pages (Foods, Today, Weight, Stats, Settings) are built and deployed, with a custom warm, dark-first visual identity (see `CLAUDE.md` for the design system, and git history for the full feature-by-feature timeline).

- **Foods**: categorized, and either gram-based or unit-based (e.g. "2 yogurts") for foods that are naturally counted rather than weighed. Can also be quick-added inline from Today, so logging never requires a detour to the Foods page.
- **Recipes**: group foods eaten together under one name with fixed amounts; taggable by meal type for organization only. Today can log a whole recipe in one action, or turn an already-logged meal into a new recipe directly.
- **Day Templates**: the tier above recipes — save/apply a full day's eating pattern (e.g. "Standard Monday") in one action, built from foods and/or recipes assigned to meal types.
- **Today**: log grouped by meal type (5 types, breakfast to dinner, defaulting to the current time of day), with a date navigator (incl. jump-to-today) and inline amount editing (tap to edit, with quick +/- adjust buttons).
- **Weight**: logged in 0.05kg increments with weekly averages broken down per day.
- **Settings**: a Personal Info profile calculates suggested daily calorie/protein goals from body stats and activity level, alongside manual goal entry.
- **Stats**: weekly averages against goals, with a custom date range filter plus quick presets (last month/3 months/year).

Remaining candidate: a service worker for automatic Android install prompts (currently manual "Add to Home Screen" only, which is fine for now).
