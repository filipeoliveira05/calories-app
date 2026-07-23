import { MealEntryRow } from "./MealEntryRow";
import { MEAL_TYPE_LABELS } from "@/lib/mealTypes";
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
      <div className="ml-3 inline-block rounded-t-lg bg-surface-raised px-3 py-1 text-xs font-semibold text-ink-muted">
        {MEAL_TYPE_LABELS[mealType]}
      </div>
      <div className="rounded-2xl rounded-tl-none bg-surface-raised p-3 shadow-sm">
        {entries.map((entry) => (
          <MealEntryRow key={entry.id} entry={entry} />
        ))}
        <div className="flex justify-end border-t border-hairline pt-2 text-xs text-ink-muted">
          {totals.calories.toFixed(0)} kcal · {totals.protein.toFixed(1)}g protein
        </div>
      </div>
    </div>
  );
}
