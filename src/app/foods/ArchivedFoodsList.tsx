"use client";

import { useMemo, useState, useTransition } from "react";
import { restoreArchivedFood } from "./actions";

export type ArchivedFood = {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  unitLabel: string | null;
  gramsPerUnit: number | null;
  lastLoggedAt: string;
  timesLogged: number;
};

export function ArchivedFoodsList({ archivedFoods }: { archivedFoods: ArchivedFood[] }) {
  const [query, setQuery] = useState("");
  const [restored, setRestored] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visible = useMemo(
    () => archivedFoods.filter((f) => !restored.has(f.name)),
    [archivedFoods, restored],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? visible.filter((f) => f.name.toLowerCase().includes(q)) : visible;
  }, [visible, query]);

  function dismissError(name: string) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  function restore(food: ArchivedFood) {
    dismissError(food.name);
    setPendingName(food.name);
    startTransition(async () => {
      try {
        await restoreArchivedFood(food);
        setRestored((prev) => new Set(prev).add(food.name));
      } catch (e) {
        setErrors((prev) => ({
          ...prev,
          [food.name]: e instanceof Error ? e.message : "Failed to restore",
        }));
      } finally {
        setPendingName(null);
      }
    });
  }

  return (
    <>
      <div className="mb-3 flex flex-col gap-1">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search old foods you've logged before…"
          className="w-full rounded-xl border border-hairline bg-bg px-2.5 py-2 text-sm text-ink focus:border-sage focus:outline-none"
        />
        <p className="text-xs text-ink-muted">
          Foods logged in the past that aren&rsquo;t in your database anymore. Restoring
          re-adds them and links them back to their old entries.
        </p>
      </div>

      {archivedFoods.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Nothing archived — every food you&rsquo;ve ever logged is still in your database.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-muted">No matches.</p>
      ) : (
        <div className="rounded-2xl bg-surface-raised p-3 shadow-sm">
          <div className="grid grid-cols-[1fr_6.5rem_4.5rem_5.5rem_auto] gap-2 border-b border-hairline pb-2 text-xs font-medium text-ink-muted">
            <span className="min-w-0 truncate">Name</span>
            <span>kcal/100g</span>
            <span>Protein/100g</span>
            <span>Last logged</span>
            <div className="invisible" aria-hidden>
              <button className="rounded-lg px-2 py-1 text-xs font-medium">Restore</button>
            </div>
          </div>
          {filtered.map((food) => (
            <div
              key={food.name}
              className="grid grid-cols-[1fr_6.5rem_4.5rem_5.5rem_auto] items-center gap-2 border-b border-hairline py-2 text-sm last:border-b-0"
            >
              <div className="min-w-0">
                <span className="block truncate font-medium">{food.name}</span>
                <span className="block truncate text-xs text-ink-muted">
                  Logged {food.timesLogged}×
                  {food.unitLabel ? ` · ${food.gramsPerUnit}g / ${food.unitLabel}` : ""}
                </span>
                {errors[food.name] && (
                  <span className="mt-0.5 flex items-start gap-1.5 text-xs text-danger">
                    <span className="whitespace-pre-line">{errors[food.name]}</span>
                    <button
                      type="button"
                      onClick={() => dismissError(food.name)}
                      aria-label="Dismiss"
                      className="shrink-0 font-medium text-danger hover:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              <span className="tabular-nums text-ink-muted">{food.caloriesPer100g} kcal</span>
              <span className="tabular-nums text-ink-muted">{food.proteinPer100g} g</span>
              <span className="tabular-nums text-ink-muted">{food.lastLoggedAt}</span>
              <button
                onClick={() => restore(food)}
                disabled={isPending && pendingName === food.name}
                className="rounded-lg px-2 py-1 text-xs font-medium text-sage hover:bg-sage-soft disabled:opacity-50"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
