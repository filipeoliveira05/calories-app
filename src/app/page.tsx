import { prisma } from "@/lib/prisma";
import { LogMealForm } from "./LogMealForm";
import { MealEntryRow } from "./MealEntryRow";

export const dynamic = "force-dynamic";

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export default async function TodayPage() {
  const [foods, entries, goals] = await Promise.all([
    prisma.food.findMany({ orderBy: { name: "asc" } }),
    prisma.mealEntry.findMany({
      where: { date: todayDateOnly() },
      orderBy: { createdAt: "asc" },
    }),
    prisma.goals.findUnique({ where: { id: 1 } }),
  ]);

  const totals = entries.reduce(
    (acc, e) => {
      acc.calories += (e.caloriesPer100g * e.grams) / 100;
      acc.protein += (e.proteinPer100g * e.grams) / 100;
      return acc;
    },
    { calories: 0, protein: 0 },
  );

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Today</h1>

      <LogMealForm foods={foods} />

      <div className="mb-4 flex gap-4 rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
        <div>
          <span className="text-zinc-500">Calories: </span>
          <span className="font-semibold">{totals.calories.toFixed(0)}</span>
          {goals && (
            <span className="text-zinc-400">
              {" "}
              / {goals.dailyCalorieGoal.toFixed(0)}
            </span>
          )}
        </div>
        <div>
          <span className="text-zinc-500">Protein: </span>
          <span className="font-semibold">{totals.protein.toFixed(1)} g</span>
          {goals && (
            <span className="text-zinc-400">
              {" "}
              / {goals.dailyProteinGoal.toFixed(0)} g
            </span>
          )}
        </div>
      </div>
      {!goals && (
        <p className="mb-4 text-xs text-zinc-400">
          Set daily goals on the{" "}
          <a href="/settings" className="underline">
            Settings
          </a>{" "}
          page to see progress here.
        </p>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-zinc-500">No meals logged today yet.</p>
      ) : (
        <div>
          {entries.map((entry) => (
            <MealEntryRow
              key={entry.id}
              entry={{
                id: entry.id,
                foodName: entry.foodName,
                grams: entry.grams,
                mealType: entry.mealType,
                calories: (entry.caloriesPer100g * entry.grams) / 100,
                protein: (entry.proteinPer100g * entry.grams) / 100,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
