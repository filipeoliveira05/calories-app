import { prisma } from "@/lib/prisma";
import { LogMealForm } from "./LogMealForm";
import { MealGroup } from "./MealGroup";
import { MEAL_TYPES } from "@/lib/mealTypes";
import { ProgressRing } from "@/components/ProgressRing";

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
      <h1 className="mb-1 font-display text-2xl font-semibold">Today</h1>
      <p className="mb-5 text-sm text-ink-muted">
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="mb-5 rounded-2xl bg-surface-raised p-4 shadow-sm">
        <ProgressRing
          calories={totals.calories}
          calorieGoal={goals?.dailyCalorieGoal ?? null}
          protein={totals.protein}
          proteinGoal={goals?.dailyProteinGoal ?? null}
        />
        {!goals && (
          <p className="mt-3 text-xs text-ink-muted">
            Set daily goals on the{" "}
            <a href="/settings" className="underline">
              Settings
            </a>{" "}
            page to see progress here.
          </p>
        )}
      </div>

      <LogMealForm foods={foods} />

      {entries.length === 0 ? (
        <p className="text-sm text-ink-muted">No meals logged today yet.</p>
      ) : (
        <div>
          {MEAL_TYPES.map((mealType) => {
            const mealEntries = entries
              .filter((entry) => entry.mealType === mealType)
              .map((entry) => ({
                id: entry.id,
                foodName: entry.foodName,
                grams: entry.grams,
                mealType: entry.mealType,
                calories: (entry.caloriesPer100g * entry.grams) / 100,
                protein: (entry.proteinPer100g * entry.grams) / 100,
              }));

            if (mealEntries.length === 0) return null;

            return (
              <MealGroup
                key={mealType}
                mealType={mealType}
                entries={mealEntries}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
