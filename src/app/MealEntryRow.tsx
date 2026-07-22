"use client";

import { useTransition } from "react";
import { deleteMealEntry } from "./actions";
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

  return (
    <div className="flex items-center justify-between border-b border-hairline py-2 text-sm last:border-b-0">
      <div>
        <span className="font-medium">{entry.foodName}</span>
        <span className="ml-2 text-ink-muted">{entry.grams}g</span>
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
