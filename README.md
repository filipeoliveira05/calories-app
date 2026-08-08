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

- `Food` — personal nutrition database (calories/protein per 100g), source of truth, categorized (including `MIX` for combo dishes like "arroz com peixe" that don't reduce to a single ingredient category), normally added manually through the Foods page UI
- `MealEntry` — logged meals; snapshots the food's calorie/protein values at creation time so later edits to a `Food` don't retroactively change historical logs. `foodId` is nullable (`onDelete: SetNull`), so deleting a `Food` doesn't delete its past entries — they just lose the live link and surface in the Foods page's History tab, from which they can be restored (recreating the `Food` from the snapshot and re-linking those entries). `sortOrder` tracks manual drag-reorder position within a date+mealType group; new entries append after the current max
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

Avoid bare `prisma migrate dev` against this database — schema.prisma's `@default(cuid())` is a Prisma-Client-side default, not a DB-level one, so any DB-level default added outside Prisma (e.g. editing a column directly in the Supabase UI) reads as permanent drift and `migrate dev` will offer to reset the schema to resolve it. Write migrations by hand and apply with `prisma migrate deploy` instead, or review `migrate dev --create-only`'s generated SQL before applying it.

## Deployment (Vercel)

Env vars (`DATABASE_URL`, `DIRECT_URL`, `APP_PASSWORD`) are set in the Vercel project dashboard, not committed. `build` runs `prisma generate && next build` explicitly (not just `postinstall`) because Vercel can skip `npm install`/`postinstall` on cached builds when `package-lock.json` is unchanged.

## Status

All core pages (Foods, Today, Weight, Stats, Settings) are built and deployed, with a custom warm, dark-first visual identity (see `CLAUDE.md` for the design system, and git history for the full feature-by-feature timeline).

- **Foods**: categorized, and either gram-based or unit-based (e.g. "2 yogurts") for foods that are naturally counted rather than weighed. Can also be quick-added inline from Today, so logging never requires a detour to the Foods page. The list is name-searchable and sortable by any column (name, category, kcal, protein), with toggleable category filter chips.
- **Recipes**: group foods eaten together under one name with fixed amounts; taggable by meal type for organization only. Name-searchable with toggleable meal-type filter chips. Today can log a whole recipe in one action, or turn an already-logged meal into a new recipe directly.
- **Day Templates**: the tier above recipes — save/apply a full day's eating pattern (e.g. "Standard Monday") in one action, built from foods and/or recipes assigned to meal types. Also name-searchable.
- **History** (Foods tab): search foods logged in the past whose `Food` was since deleted, and restore one back into the database from its most recent logged snapshot, re-linking its old entries.
- **Today**: log grouped by meal type (5 types, breakfast to dinner, defaulting to the current time of day), with a date navigator (incl. jump-to-today) and inline amount editing (tap to edit, with quick +/- adjust buttons). Food/recipe selection uses a searchable combobox rather than a long native dropdown, for easier picking on mobile. The dual progress ring shows a calories/protein "remaining" (or "over", flagged in red) readout beneath each ring's totals. Entries can be checkbox-selected (across meal types) for a combined total and bulk delete, and drag-reordered within a meal card.
- **Weight**: logged in 0.05kg increments with weekly averages broken down per day; each week shows a trend delta vs. the prior week, incomplete weeks get a day-count badge with ghost rows for missed days on expand (loggable inline, prefilled from the most recent entry), and logged entries support inline editing with quick-adjust steppers.
- **Settings**: a Personal Info profile calculates suggested daily calorie/protein goals from body stats and activity level, alongside manual goal entry.
- **Stats**: weekly averages against goals (excluding days with nothing logged), with a custom date range filter plus quick presets (last month/3 months/year); the selected range persists to the URL (`?from=&to=`) so a refresh or shared link keeps it.

Remaining candidate: a service worker for automatic Android install prompts (currently manual "Add to Home Screen" only, which is fine for now).

## Historical data

The full ~5 years of the original Excel food log (2021-06-19 through present) has been backfilled into `MealEntry`/`Food`, parsed and validated day-by-day against the sheet's own totals before import. This was a one-off migration (a local Prisma script, not part of the app), not an ongoing import feature — new `Food`/`MealEntry` records are otherwise only ever created through the app itself.
