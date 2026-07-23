@AGENTS.md

# Project context

This app replaces a years-old manual Excel workflow for tracking gym nutrition progress. The Excel file had three parts, all of which this app should cover as well as or better than Excel:

1. **Food log** — entries like "Bread 100g" or "Rice 300g", with calories/protein looked up from a personal nutrition database and manually calculated per portion. In the app: `Food` stores per-100g values, `MealEntry` snapshots the computed calories/protein at log time (so later edits to a `Food` don't retroactively change historical logs).
2. **Weight tracking** — daily morning weigh-ins, with a weekly average to track trend. In the app: `WeightEntry`, one per day, weekly average computed in `src/lib/weeks.ts`.
3. **Stats** — weekly averages of calories and protein against daily goals. In the app: Stats page + `Goals` (single-row daily targets).

The app is a personal, single-user tool (password-gated, no multi-user auth). Full stack/architecture details, data model, and deployment notes live in `README.md` — read it for specifics rather than duplicating here.

**Status**: as of 2026-07-23, all core pages (Foods, Today, Weight, Stats, Settings) are built and deployed to Vercel, with the warm dark-first redesign applied and several rounds of UX polish since (meal-type grouping on Today, weekly weigh-in breakdowns and custom date-range filtering on Stats, alignment/cursor/theming fixes). Treat this as a working, deployed app, not a WIP — check git history before assuming something is unbuilt, since each commit corresponds to one feature area with a detailed message.

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

# Working preferences

- **Commits**: commit after each completed task automatically, without asking first. Match the style of existing commit messages (short, conventional-style prefix like `feat:`/`fix:`/`perf:`/`chore:`/`docs:`, description framed in terms of the project/feature, not the mechanics of the change). Do NOT push to `main` after committing — commits stay local until the user explicitly says to push (this repo auto-deploys on push to `main`, so pushing is a separate, deliberate step).
- **Verification**: before reporting a task as done, actually run it — start the dev server and exercise the feature (and check for regressions) rather than relying on types/tests alone.
- **Planning**: for non-trivial features, give a brief check-in on the approach, then go straight to implementation — no need for full plan-mode back-and-forth unless something is genuinely ambiguous.
- **Background**: comfortable with code in general, but newer to this specific stack (Next.js App Router, Prisma, Vercel). Explain stack-specific decisions and gotchas (e.g. why the engine-less Prisma client, why two Supabase connection strings) rather than assuming familiarity with them — but skip general programming explanations.
