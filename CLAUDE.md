@AGENTS.md

# Project context

This app replaces a years-old manual Excel workflow for tracking gym nutrition progress. The Excel file had three parts, all of which this app should cover as well as or better than Excel:

1. **Food log** — entries like "Bread 100g" or "Rice 300g", with calories/protein looked up from a personal nutrition database and manually calculated per portion. In the app: `Food` stores per-100g values, `MealEntry` snapshots the computed calories/protein at log time (so later edits to a `Food` don't retroactively change historical logs). `Recipe`/`RecipeIngredient` group foods commonly eaten together under one name with fixed amounts, so logging a whole meal is one action that creates one `MealEntry` per ingredient. `DayTemplate`/`DayTemplateEntry` group a full day's worth of meals (foods and/or recipes, tagged per meal type) under one name, so applying a recurring day like "Standard Monday" is a single action too.
2. **Weight tracking** — daily morning weigh-ins, with a weekly average to track trend. In the app: `WeightEntry`, one per day, weekly average computed in `src/lib/weeks.ts`.
3. **Stats** — weekly averages of calories and protein against daily goals. In the app: Stats page + `Goals` (single-row daily targets).

The app is a personal, single-user tool (password-gated, no multi-user auth). Full stack/architecture details, data model, and deployment notes live in `README.md` — read it for specifics rather than duplicating here.

**Status**: all core pages (Foods, Today, Weight, Stats, Settings) are built and deployed to Vercel, with the warm dark-first redesign applied. Treat this as a working, deployed app, not a WIP — check git history for the how/why behind any feature (each commit maps to one feature area with a detailed message) rather than assuming something is unbuilt.

Current feature set, by area:
- **Foods**: categorized (`FoodCategory` enum, including `MIX` for combo dishes like "arroz com peixe" that don't reduce to one ingredient category — added specifically for the historical import below), gram- or unit-based (e.g. "2 yogurts"). Can also be quick-added inline from Today (`QuickAddFood.tsx`) without a detour to the Foods page — added for first-run/empty-database friction (e.g. someone else deploying their own instance), not day-to-day use; a seeded external nutrition database was considered for the same problem and rejected as conflicting with this app's personally-curated per-100g values. Shares field markup (`FoodFields.tsx`/`FoodUnitToggleFields`) with the Foods page's own Add Food form. The list (`FoodsList.tsx`) has a name-search box and sortable column headers — Name/Category cycle asc→desc→default, kcal/Protein cycle desc→asc→default; category filter chips (here and on Recipes) toggle off by tapping the active one again.
- **Recipes** (`src/app/foods/RecipesList.tsx` etc.): named groups of foods with fixed amounts, taggable by `MealType` for organization only (tagging never restricts where a recipe can be logged). Has its own name-search box alongside the toggleable meal-type filter chips. Today can also turn an already-logged meal-type group directly into a new Recipe (`SaveMealAsRecipe.tsx`), auto-tagged with that meal type, with exact-content duplicate detection ("Save anyway" instead of silently duplicating).
- **Day Templates**: the tier above Recipes — `DayTemplate`/`DayTemplateEntry` (flat food+mealType+amount rows, no live link back to `Recipe`) save/apply a full day's eating pattern in one action. Built on a Templates tab on Foods (`DayTemplatesList.tsx`, has its own name-search box; `DayTemplateEntryEditor.tsx`); applied/saved/cleared from Today via `DayTools.tsx` (applying on top of a non-empty day warns first, never replaces/deletes).
- **History** (`ArchivedFoodsList.tsx`, a tab on Foods): search of foods that were logged in the past but deleted since — `MealEntry` snapshots survive `Food` deletion (`foodId` goes to `null` via `onDelete: SetNull`), so this tab lists distinct names from those orphaned entries with a "Restore" action that recreates the `Food` from the most recent snapshot and re-links the old entries to it. Deleting a restored food again sends it right back to History — that's the intended round-trip, not a bug.
- **Today**: meals grouped by meal type (`MealGroup.tsx`), meal-type field defaults to time of day, date nav includes a jump-to-today button. Logged entries support inline amount editing with quick-adjust +/- buttons (±10g/±50g gram-based, ±1 unit-based, clamped at zero). Food/recipe pickers (here, in recipe ingredient rows, and in the Day Template entry editor) share a searchable combobox (`src/components/SearchableSelect.tsx`) instead of a native `<select>` — scrolling one long grouped dropdown was painful on mobile.
- **Settings**: derives suggested calorie/protein goals from a Personal Info profile (sex, birth date, height, activity level, weight goal, protein target) via Mifflin-St Jeor (`src/lib/nutritionGoals.ts`), using weekly-average weight (`getLatestWeeklyAverageWeight` in `src/lib/weeks.ts`); manual goal entry remains available separately.
- **Stats**: weekly calorie/protein averages vs. goals, with custom date-range filtering and quick presets (last month/3 months/year); days with zero calories or protein logged are excluded from an average rather than dragging it down.

Cross-cutting conventions worth knowing: Cancel-before-Save button order in edit-mode forms; dismissible inline error messages (× button) rather than errors that stick around; deleting a `Food`/`Recipe` still referenced elsewhere is blocked with an error naming what references it.

**Historical data**: the full ~5 years of the original Excel food log (2021-06-19 onward) is backfilled into `MealEntry`/`Food` — treat the app's history as real, not sparse/seed data. This was a one-off local migration script (parsed the Excel day-by-day, validated every day's total against the sheet's own `TOTAL`/`PROTEÍNA` rows before writing, ran once directly against Supabase via Prisma), not a feature of the app itself and not reflected in git history the way normal features are — there's nothing to find in `git log` for it beyond the `MIX` category commit it required. If historical `Food`/`MealEntry` data looks off, that's the migration to reconsider, not app code.

# Design system

As of 2026-07-22, the app has a custom warm, dark-first visual identity (replacing default Next.js/Tailwind styling). Mood: warm & personal, not clinical — this is a personal diary, not a generic fitness SaaS. Defined in `src/app/globals.css` (CSS variable tokens, flipped via `prefers-color-scheme`) and consumed via Tailwind v4 `@theme inline`.

**Palette** — named tokens, not raw Tailwind grays:
- `bg` / `surface` / `surface-raised` — warm cream (`#fbf7ef` light) / near-black warm charcoal (`#1a1712` dark), not stark white/black
- `ink` / `ink-muted` — warm dark-brown / warm off-white text, with a muted variant for secondary text
- `sage` (+ `sage-soft`) — primary accent, used for calories and primary actions
- `terracotta` (+ `terracotta-soft`) — secondary accent, used for protein — calories and protein always get their own distinct color, never share one
- `gold` (+ `gold-soft`) — tertiary accent, used only for weight tracking in Stats
- `danger` — destructive actions (Remove/Delete)
- `hairline` — border color (a global `* { border-color: var(--color-hairline) }` reset replaces Tailwind v4's default `currentColor` border)

**Type**: Fraunces (serif, `font-display`) for page headings and big numbers (used sparingly), Karla (`font-sans`) for everything else. Tabular numerals (`tabular-nums`) on any logged/listed value (grams, kcal, kg) so lists align.

**Layout conventions**:
- Card-based: `rounded-2xl bg-surface-raised p-4 shadow-sm` is the standard card; inputs are `rounded-xl border border-hairline bg-bg`
- Bottom tab bar (`src/components/NavBar.tsx`) instead of a top nav — logging happens on the phone at each meal, so nav should be thumb-reachable. Active tab highlighted in `sage`.
- Meal groups on Today (`src/app/MealGroup.tsx`) are styled as soft tabbed dividers (a nod to the physical food-diary/Excel origin), not plain list headers.

**Signature element**: the dual progress ring on Today (`src/components/ProgressRing.tsx`) — concentric sage (calories) + terracotta (protein) rings against daily goals. This is the one deliberately distinctive visual moment; keep the rest of the UI disciplined/quiet around it rather than adding more decorative flourishes elsewhere.

When adding new UI, reuse these tokens/patterns rather than reaching for default Tailwind colors (`zinc`, `blue`, etc.) or ad hoc styling.

**Reference mobile viewport**: the user tests on a 393×851 CSS-pixel viewport (DPR 2.75) via Chrome DevTools device emulation. Use this as the concrete "phone" width when reasoning about responsive/overflow issues — Tailwind's default `sm` breakpoint (640px) sits well above it, so this viewport always falls in the below-`sm` case.

# Working preferences

- **Commits**: commit after each completed task automatically, without asking first. Match the style of existing commit messages (short, conventional-style prefix like `feat:`/`fix:`/`perf:`/`chore:`/`docs:`, description framed in terms of the project/feature, not the mechanics of the change). Do NOT push to `main` after committing — commits stay local until the user explicitly says to push (this repo auto-deploys on push to `main`, so pushing is a separate, deliberate step).
- **Verification**: before reporting a task as done, actually run it — start the dev server and exercise the feature (and check for regressions) rather than relying on types/tests alone.
- **Dev server**: the user typically already has `npm run dev` running on localhost:3000 before starting work with you. Don't assume it's down and start a redundant instance — check first (e.g. hit localhost:3000 or check for the process) before running `npm run dev` yourself.
- **Planning**: for non-trivial features, give a brief check-in on the approach, then go straight to implementation — no need for full plan-mode back-and-forth unless something is genuinely ambiguous.
- **Background**: comfortable with code in general, but newer to this specific stack (Next.js App Router, Prisma, Vercel). Explain stack-specific decisions and gotchas (e.g. why the engine-less Prisma client, why two Supabase connection strings) rather than assuming familiarity with them — but skip general programming explanations.
