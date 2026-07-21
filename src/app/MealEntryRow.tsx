"use client";

import { useTransition } from "react";
import { deleteMealEntry } from "./actions";
import { MEAL_TYPE_LABELS } from "@/lib/mealTypes";
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
    <div className="flex items-center justify-between border-b border-black/5 py-2 text-sm dark:border-white/5">
      <div>
        <span className="font-medium">{entry.foodName}</span>
        <span className="ml-2 text-zinc-500">{entry.grams}g</span>
        <span className="ml-2 text-xs text-zinc-400">
          {MEAL_TYPE_LABELS[entry.mealType]}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-zinc-600 dark:text-zinc-400">
          {entry.calories.toFixed(0)} kcal · {entry.protein.toFixed(1)}g
          protein
        </span>
        <button
          onClick={() => startTransition(() => deleteMealEntry(entry.id))}
          disabled={isPending}
          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
