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

export function MealEntryRow({
  entry,
  selected,
  onToggle,
}: {
  entry: Entry;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const isUnitBased = entry.quantity != null;
  const [amount, setAmount] = useState(
    String(isUnitBased ? entry.quantity : entry.grams),
  );

  const steps = isUnitBased ? [-1, 1] : [-50, -10, 10, 50];

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

  function adjust(delta: number) {
    const current = Number(amount) || 0;
    const next = Math.max(0, current + delta);
    setAmount(String(next));
  }

  return (
    <div className="border-b border-hairline py-2 text-sm last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(entry.id)}
            className="mr-2 h-4 w-4 shrink-0 accent-sage"
            aria-label={`Select ${entry.foodName}`}
          />
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
        {!isEditing && (
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
        )}
      </div>
      {isEditing && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {steps.map((step) => {
            const positive = step > 0;
            const colorClasses = positive
              ? "border border-sage text-sage"
              : "border border-danger text-danger";
            return (
              <button
                key={step}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => adjust(step)}
                className={`rounded-lg px-2 py-0.5 text-xs font-medium tabular-nums ${colorClasses}`}
              >
                {step > 0 ? `+${step}` : step}
                {isUnitBased ? "" : "g"}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
