"use client";

import { useState, useTransition } from "react";
import { MealGroup } from "./MealGroup";
import { deleteMealEntries } from "./actions";
import { MEAL_TYPES } from "@/lib/mealTypes";
import type { MealType } from "@/generated/prisma/enums";

type Entry = {
  id: string;
  foodName: string;
  grams: number;
  quantity: number | null;
  unitLabel: string | null;
  mealType: MealType;
  calories: number;
  protein: number;
};

export function EntriesWithSelection({ entries, date }: { entries: Entry[]; date: string }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function deleteSelected() {
    const ids = selectedEntries.map((e) => e.id);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected ${ids.length === 1 ? "entry" : "entries"}?`)) return;
    startTransition(async () => {
      await deleteMealEntries(ids);
      clearSelection();
    });
  }

  const selectedEntries = entries.filter((e) => selectedIds.has(e.id));
  const selectedTotals = selectedEntries.reduce(
    (acc, e) => {
      acc.calories += e.calories;
      acc.protein += e.protein;
      return acc;
    },
    { calories: 0, protein: 0 },
  );

  return (
    <div style={selectedEntries.length > 0 ? { paddingBottom: "2rem" } : undefined}>
      {MEAL_TYPES.map((mealType) => {
        const mealEntries = entries.filter((entry) => entry.mealType === mealType);
        if (mealEntries.length === 0) return null;

        return (
          <MealGroup
            key={mealType}
            mealType={mealType}
            entries={mealEntries}
            date={date}
            selectedIds={selectedIds}
            onToggle={toggle}
          />
        );
      })}

      {selectedEntries.length > 0 && (
        <div
          className="fixed inset-x-0 z-10 flex justify-center px-4"
          style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom))" }}
        >
          <div className="flex w-full max-w-2xl items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-surface-raised px-4 py-3 shadow-lg">
            <span className="text-sm tabular-nums text-ink-muted">
              {selectedEntries.length} selected · {selectedTotals.calories.toFixed(0)} kcal ·{" "}
              {selectedTotals.protein.toFixed(1)}g protein
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={clearSelection}
                disabled={isPending}
                className="text-sm font-medium text-ink-muted hover:underline disabled:opacity-50"
              >
                Clear
              </button>
              <button
                onClick={deleteSelected}
                disabled={isPending}
                className="text-sm font-medium text-danger hover:underline disabled:opacity-50"
              >
                Delete selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
