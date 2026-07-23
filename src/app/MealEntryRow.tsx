"use client";

import { useState, useTransition } from "react";
import {
  deleteMealEntry,
  updateMealEntryGrams,
  updateMealEntryQuantity,
} from "./actions";
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

export function MealEntryRow({ entry }: { entry: Entry }) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const isUnitBased = entry.quantity != null;
  const [amount, setAmount] = useState(
    String(isUnitBased ? entry.quantity : entry.grams),
  );

  function save() {
    const value = Number(amount);
    const originalValue = isUnitBased ? entry.quantity! : entry.grams;
    if (!Number.isFinite(value) || value <= 0) {
      setAmount(String(originalValue));
      setIsEditing(false);
      return;
    }
    setIsEditing(false);
    if (value !== originalValue) {
      startTransition(() =>
        isUnitBased
          ? updateMealEntryQuantity(entry.id, value)
          : updateMealEntryGrams(entry.id, value),
      );
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
            step={isUnitBased ? "0.5" : "1"}
            min="0"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setAmount(String(isUnitBased ? entry.quantity : entry.grams));
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
            {isUnitBased ? `${entry.quantity} ${entry.unitLabel}` : `${entry.grams}g`}
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
