"use client";

import { MEAL_TYPES, MEAL_TYPE_LABELS } from "@/lib/mealTypes";
import type { MealType } from "@/generated/prisma/enums";

export function MealTypePicker({ defaultValues = [] }: { defaultValues?: MealType[] }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-ink-muted">Meal types (optional)</label>
      <div className="flex flex-wrap gap-1.5">
        {MEAL_TYPES.map((mealType) => (
          <label key={mealType} className="cursor-pointer">
            <input
              type="checkbox"
              name="mealTypes"
              value={mealType}
              defaultChecked={defaultValues.includes(mealType)}
              className="peer sr-only"
            />
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-muted peer-checked:bg-sage peer-checked:text-white">
              {MEAL_TYPE_LABELS[mealType]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
