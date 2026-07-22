import { MealEntryRow } from "./MealEntryRow";
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

export function MealGroup({
  mealType,
  entries,
}: {
  mealType: MealType;
  entries: Entry[];
}) {
  const totals = entries.reduce(
    (acc, e) => {
      acc.calories += e.calories;
      acc.protein += e.protein;
      return acc;
    },
    { calories: 0, protein: 0 },
  );

  return (
    <div className="mb-4">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{MEAL_TYPE_LABELS[mealType]}</h2>
        <span className="text-xs text-zinc-500">
          {totals.calories.toFixed(0)} kcal · {totals.protein.toFixed(1)}g
          protein
        </span>
      </div>
      <div>
        {entries.map((entry) => (
          <MealEntryRow key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
