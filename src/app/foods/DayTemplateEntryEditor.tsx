"use client";

import { useMemo, useState } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { foodsByCategory, type Food } from "./IngredientRows";
import type { Recipe } from "./RecipeCard";
import { MEAL_TYPES, MEAL_TYPE_LABELS } from "@/lib/mealTypes";
import { FOOD_CATEGORY_LABELS } from "@/lib/foodCategories";
import type { MealType } from "@/generated/prisma/enums";

export type DayTemplateDraftEntry = {
  key: string;
  mealType: MealType;
  foodId: string;
  amount: string;
};

const inputClasses =
  "rounded-lg border border-hairline bg-bg px-2 py-1.5 text-sm text-ink focus:border-sage focus:outline-none";

export function entryTotals(
  foods: Food[],
  entries: { foodId: string; amount: string }[],
) {
  const foodMap = new Map(foods.map((f) => [f.id, f]));
  return entries.reduce(
    (acc, entry) => {
      const food = foodMap.get(entry.foodId);
      const amountNum = Number(entry.amount);
      if (!food || !Number.isFinite(amountNum) || amountNum <= 0) return acc;
      const grams = food.isLoggedByUnit ? amountNum * (food.gramsPerUnit ?? 0) : amountNum;
      acc.calories += (food.caloriesPer100g * grams) / 100;
      acc.protein += (food.proteinPer100g * grams) / 100;
      return acc;
    },
    { calories: 0, protein: 0 },
  );
}

export function DayTemplateEntryEditor({
  foods,
  recipes,
  entries,
  onChange,
}: {
  foods: Food[];
  recipes: Recipe[];
  entries: DayTemplateDraftEntry[];
  onChange: (entries: DayTemplateDraftEntry[]) => void;
}) {
  const [mode, setMode] = useState<"food" | "recipe">("food");
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");
  const [foodId, setFoodId] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [amount, setAmount] = useState("");

  const foodMap = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods]);
  const grouped = useMemo(() => foodsByCategory(foods), [foods]);
  const foodItems = useMemo(
    () =>
      grouped.flatMap(({ category, foods: catFoods }) =>
        catFoods.map((f) => ({
          id: f.id,
          label: f.name,
          groupLabel: FOOD_CATEGORY_LABELS[category],
        })),
      ),
    [grouped],
  );
  const recipeItems = useMemo(
    () => recipes.map((r) => ({ id: r.id, label: r.name })),
    [recipes],
  );
  const selectedFood = foodMap.get(foodId) ?? null;
  const selectedRecipe = recipes.find((r) => r.id === recipeId) ?? null;

  const groupedEntries = MEAL_TYPES.map((mt) => ({
    mealType: mt,
    entries: entries.filter((e) => e.mealType === mt),
    totals: entryTotals(
      foods,
      entries.filter((e) => e.mealType === mt),
    ),
  })).filter((g) => g.entries.length > 0);

  const dayTotals = entryTotals(foods, entries);

  function addFood() {
    if (!foodId) return;
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) return;
    onChange([...entries, { key: crypto.randomUUID(), mealType, foodId, amount }]);
    setFoodId("");
    setAmount("");
  }

  function addRecipe() {
    if (!selectedRecipe) return;
    const newEntries = selectedRecipe.ingredients.map((ri) => ({
      key: crypto.randomUUID(),
      mealType,
      foodId: ri.foodId,
      amount: String(ri.grams ?? ri.quantity ?? ""),
    }));
    onChange([...entries, ...newEntries]);
    setRecipeId("");
  }

  function remove(key: string) {
    onChange(entries.filter((e) => e.key !== key));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden">
        {entries.map((entry) => (
          <div key={entry.key}>
            <input type="hidden" name="entryMealType" value={entry.mealType} />
            <input type="hidden" name="entryFoodId" value={entry.foodId} />
            <input type="hidden" name="entryAmount" value={entry.amount} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-bg p-3">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setMode("food")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              mode === "food" ? "bg-sage text-white" : "bg-surface-raised text-ink-muted"
            }`}
          >
            Food
          </button>
          <button
            type="button"
            onClick={() => setMode("recipe")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              mode === "recipe" ? "bg-sage text-white" : "bg-surface-raised text-ink-muted"
            }`}
          >
            Recipe
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {mode === "food" ? (
            <SearchableSelect
              items={foodItems}
              value={foodId}
              onChange={setFoodId}
              placeholder="Search food..."
              className={inputClasses}
            />
          ) : (
            <SearchableSelect
              items={recipeItems}
              value={recipeId}
              onChange={setRecipeId}
              placeholder="Search recipe..."
              className={inputClasses}
            />
          )}
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className={inputClasses}
          >
            {MEAL_TYPES.map((mt) => (
              <option key={mt} value={mt}>
                {MEAL_TYPE_LABELS[mt]}
              </option>
            ))}
          </select>
        </div>

        {mode === "food" ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              step={selectedFood?.isLoggedByUnit ? "0.5" : "1"}
              min="0"
              placeholder={selectedFood?.isLoggedByUnit ? "qty" : "grams"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-24 ${inputClasses}`}
            />
            <span className="text-xs text-ink-muted">
              {selectedFood?.isLoggedByUnit ? (selectedFood.unitLabel ?? "unit") : "g"}
            </span>
            <button
              type="button"
              onClick={addFood}
              disabled={!foodId || !amount}
              className="ml-auto w-fit rounded-lg px-2 py-1 text-xs font-medium text-sage hover:bg-sage-soft disabled:opacity-50"
            >
              + Add to template
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={addRecipe}
            disabled={!recipeId}
            className="ml-auto w-fit rounded-lg px-2 py-1 text-xs font-medium text-sage hover:bg-sage-soft disabled:opacity-50"
          >
            + Add to template
          </button>
        )}
      </div>

      {groupedEntries.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-hairline p-3">
          {groupedEntries.map(({ mealType: mt, entries: mtEntries, totals }) => (
            <div key={mt}>
              <span className="w-fit rounded-full bg-sage-soft px-2 py-0.5 text-[0.65rem] font-medium text-sage">
                {MEAL_TYPE_LABELS[mt]}
              </span>
              <ul className="mt-1 flex flex-col gap-0.5">
                {mtEntries.map((entry) => {
                  const food = foodMap.get(entry.foodId);
                  return (
                    <li
                      key={entry.key}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        {food?.name ?? "Unknown food"}{" "}
                        <span className="tabular-nums text-xs text-ink-muted">
                          {entry.amount}
                          {food?.isLoggedByUnit ? ` ${food.unitLabel ?? "unit"}` : "g"}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(entry.key)}
                        className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-danger hover:bg-terracotta-soft"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-1 text-xs text-ink-muted">
                → {totals.calories.toFixed(0)} kcal, {totals.protein.toFixed(1)} g protein
              </p>
            </div>
          ))}
        </div>
      )}

      {groupedEntries.length > 0 && (
        <p className="text-sm text-ink-muted">
          → {dayTotals.calories.toFixed(0)} kcal, {dayTotals.protein.toFixed(1)} g protein
        </p>
      )}
    </div>
  );
}
