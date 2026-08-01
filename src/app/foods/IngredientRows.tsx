"use client";

import { useMemo } from "react";
import { SearchableSelect } from "@/components/SearchableSelect";
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from "@/lib/foodCategories";
import type { FoodCategory } from "@/generated/prisma/enums";

export type Food = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  category: FoodCategory;
  isLoggedByUnit: boolean;
  unitLabel: string | null;
  gramsPerUnit: number | null;
};

export type IngredientDraft = { key: string; foodId: string; amount: string };

const inputClasses =
  "rounded-lg border border-hairline bg-bg px-2 py-1.5 text-sm text-ink focus:border-sage focus:outline-none";

export function foodsByCategory(foods: Food[]) {
  return FOOD_CATEGORIES.map((category) => ({
    category,
    foods: foods.filter((f) => f.category === category),
  })).filter((group) => group.foods.length > 0);
}

export function IngredientRows({
  foods,
  ingredients,
  onChange,
}: {
  foods: Food[];
  ingredients: IngredientDraft[];
  onChange: (ingredients: IngredientDraft[]) => void;
}) {
  const grouped = foodsByCategory(foods);
  const foodMap = new Map(foods.map((f) => [f.id, f]));
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

  function update(key: string, patch: Partial<IngredientDraft>) {
    onChange(ingredients.map((ing) => (ing.key === key ? { ...ing, ...patch } : ing)));
  }

  function remove(key: string) {
    onChange(ingredients.filter((ing) => ing.key !== key));
  }

  function add() {
    onChange([...ingredients, { key: crypto.randomUUID(), foodId: "", amount: "" }]);
  }

  return (
    <div className="flex flex-col gap-2">
      {ingredients.map((ing) => {
        const food = foodMap.get(ing.foodId) ?? null;
        return (
          <div key={ing.key} className="flex items-center gap-2">
            <SearchableSelect
              name="ingredientFoodId"
              items={foodItems}
              value={ing.foodId}
              onChange={(id) => update(ing.key, { foodId: id })}
              placeholder="Search food..."
              className={inputClasses}
              containerClassName="min-w-0 flex-1"
            />
            <input
              name="ingredientAmount"
              type="number"
              step={food?.isLoggedByUnit ? "0.5" : "1"}
              min="0"
              placeholder={food?.isLoggedByUnit ? "qty" : "grams"}
              value={ing.amount}
              onChange={(e) => update(ing.key, { amount: e.target.value })}
              required
              className={`w-20 ${inputClasses}`}
            />
            <span className="w-10 shrink-0 text-xs text-ink-muted">
              {food?.isLoggedByUnit ? (food.unitLabel ?? "unit") : "g"}
            </span>
            <button
              type="button"
              onClick={() => remove(ing.key)}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-danger hover:bg-terracotta-soft"
            >
              Remove
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className="w-fit rounded-lg px-2 py-1 text-xs font-medium text-sage hover:bg-sage-soft"
      >
        + Add ingredient
      </button>
    </div>
  );
}

export function ingredientTotals(foods: Food[], ingredients: { foodId: string; amount: string }[]) {
  const foodMap = new Map(foods.map((f) => [f.id, f]));
  return ingredients.reduce(
    (acc, ing) => {
      const food = foodMap.get(ing.foodId);
      const amountNum = Number(ing.amount);
      if (!food || !Number.isFinite(amountNum) || amountNum <= 0) return acc;
      const grams = food.isLoggedByUnit ? amountNum * (food.gramsPerUnit ?? 0) : amountNum;
      acc.calories += (food.caloriesPer100g * grams) / 100;
      acc.protein += (food.proteinPer100g * grams) / 100;
      return acc;
    },
    { calories: 0, protein: 0 },
  );
}
