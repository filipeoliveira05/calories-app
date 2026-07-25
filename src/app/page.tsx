import { prisma } from "@/lib/prisma";
import { LogMealForm } from "./LogMealForm";
import { MealGroup } from "./MealGroup";
import { DateNav } from "./DateNav";
import { DayTools } from "./DayTools";
import { MEAL_TYPES } from "@/lib/mealTypes";
import { ProgressRing } from "@/components/ProgressRing";
import { dateOnlyFromParam, dateParam, addDays, isSameDate } from "@/lib/dateOnly";

export const dynamic = "force-dynamic";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParamValue } = await searchParams;
  const selectedDate = dateOnlyFromParam(dateParamValue);
  const today = dateOnlyFromParam(undefined);
  const isToday = isSameDate(selectedDate, today);

  const [foods, recipes, templates, entries, goals] = await Promise.all([
    prisma.food.findMany({ orderBy: { name: "asc" } }),
    prisma.recipe.findMany({
      orderBy: { name: "asc" },
      include: { ingredients: { include: { food: true } } },
    }),
    prisma.dayTemplate.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.mealEntry.findMany({
      where: { date: selectedDate },
      orderBy: { createdAt: "asc" },
    }),
    prisma.goals.findUnique({ where: { id: 1 } }),
  ]);

  const recipesForUi = recipes.map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    ingredients: recipe.ingredients.map((ri) => ({
      id: ri.id,
      foodName: ri.food.name,
      grams: ri.grams,
      quantity: ri.quantity,
      unitLabel: ri.food.unitLabel,
      caloriesPer100g: ri.food.caloriesPer100g,
      proteinPer100g: ri.food.proteinPer100g,
      isLoggedByUnit: ri.food.isLoggedByUnit,
      gramsPerUnit: ri.food.gramsPerUnit,
    })),
  }));

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
      <h1 className="mb-1 font-display text-2xl font-semibold">
        {isToday
          ? "Today"
          : isSameDate(selectedDate, addDays(today, -1))
            ? "Yesterday"
            : isSameDate(selectedDate, addDays(today, 1))
              ? "Tomorrow"
              : selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  timeZone: "UTC",
                })}
      </h1>

      <DateNav
        selectedDate={dateParam(selectedDate)}
        label={selectedDate.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: selectedDate.getUTCFullYear() === today.getUTCFullYear() ? undefined : "numeric",
          timeZone: "UTC",
        })}
      />

      <div className="mb-5 rounded-2xl bg-surface-raised p-4 shadow-sm">
        {isToday ? (
          <>
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
          </>
        ) : (
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-baseline gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sage" />
              <span className="font-display text-xl font-semibold">
                {totals.calories.toFixed(0)}
              </span>
              <span className="text-ink-muted">kcal</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="h-2 w-2 rounded-full bg-terracotta" />
              <span className="font-display text-xl font-semibold">
                {totals.protein.toFixed(1)}
              </span>
              <span className="text-ink-muted">g protein</span>
            </div>
          </div>
        )}
      </div>

      <DayTools templates={templates} date={dateParam(selectedDate)} entryCount={entries.length} />

      <LogMealForm foods={foods} recipes={recipesForUi} date={dateParam(selectedDate)} />

      {entries.length === 0 ? (
        <p className="text-sm text-ink-muted">No meals logged this day yet.</p>
      ) : (
        <div>
          {MEAL_TYPES.map((mealType) => {
            const mealEntries = entries
              .filter((entry) => entry.mealType === mealType)
              .map((entry) => ({
                id: entry.id,
                foodName: entry.foodName,
                grams: entry.grams,
                quantity: entry.quantity,
                unitLabel: entry.unitLabel,
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
                date={dateParam(selectedDate)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
