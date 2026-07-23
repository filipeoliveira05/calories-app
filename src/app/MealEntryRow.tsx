"use client";

import { useState, useTransition } from "react";
import { deleteMealEntry, updateMealEntryGrams } from "./actions";
import type { MealType } from "@/generated/prisma/enums";

type Entry = {
  id: string;
  foodName: string;
  grams: number;
  mealType: MealType;
  calories: number;
  protein: number;
};

export function MealEntryRow({ entry }: { entry: Entry }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [grams, setGrams] = useState(String(entry.grams));

  function save() {
    const value = Number(grams);
    if (!Number.isFinite(value) || value <= 0) {
      setGrams(String(entry.grams));
      setIsEditing(false);
      return;
    }
    setIsEditing(false);
    if (value !== entry.grams) {
      startTransition(() => updateMealEntryGrams(entry.id, value));
    }
  }

  return (
    <div className="flex items-center justify-between border-b border-hairline py-2 text-sm last:border-b-0">
      <div>
        <span className="font-medium">{entry.foodName}</span>
        {isEditing ? (
          <input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            autoFocus
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setGrams(String(entry.grams));
                setIsEditing(false);
              }
            }}
            className="ml-2 w-16 rounded-lg border border-hairline bg-bg px-1.5 py-0.5 text-sm tabular-nums"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="ml-2 text-ink-muted underline decoration-dotted underline-offset-2"
          >
            {entry.grams}g
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="tabular-nums text-ink-muted">
          {entry.calories.toFixed(0)} kcal · {entry.protein.toFixed(1)}g
        </span>
        <button
          onClick={() => startTransition(() => deleteMealEntry(entry.id))}
          disabled={isPending}
          className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
