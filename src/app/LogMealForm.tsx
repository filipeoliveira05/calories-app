"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { logMeal } from "./actions";
import { MEAL_TYPES, MEAL_TYPE_LABELS } from "@/lib/mealTypes";
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from "@/lib/foodCategories";
import type { FoodCategory } from "@/generated/prisma/enums";

type Food = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  category: FoodCategory;
};

const inputClasses =
  "rounded-xl border border-hairline bg-bg px-3 py-2.5 text-sm text-ink focus:border-sage focus:outline-none";

export function LogMealForm({ foods }: { foods: Food[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [foodId, setFoodId] = useState("");
  const [grams, setGrams] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedFood = useMemo(
    () => foods.find((f) => f.id === foodId) ?? null,
    [foods, foodId],
  );

  const foodsByCategory = useMemo(() => {
    return FOOD_CATEGORIES.map((category) => ({
      category,
      foods: foods.filter((f) => f.category === category),
    })).filter((group) => group.foods.length > 0);
  }, [foods]);

  const gramsNum = Number(grams);
  const preview =
    selectedFood && Number.isFinite(gramsNum) && gramsNum > 0
      ? {
          calories: (selectedFood.caloriesPer100g * gramsNum) / 100,
          protein: (selectedFood.proteinPer100g * gramsNum) / 100,
        }
      : null;

  if (foods.length === 0) {
    return (
      <p className="mb-6 rounded-2xl bg-surface-raised p-4 text-sm text-ink-muted shadow-sm">
        You don&apos;t have any foods yet. Add some on the{" "}
        <a href="/foods" className="text-sage underline">
          Foods
        </a>{" "}
        page first.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await logMeal(formData);
            formRef.current?.reset();
            setFoodId("");
            setGrams("");
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to log meal");
          }
        });
      }}
      className="mb-6 flex flex-col gap-2.5 rounded-2xl bg-surface-raised p-4 shadow-sm"
    >
      <div className="grid grid-cols-2 gap-2">
        <select
          name="foodId"
          value={foodId}
          onChange={(e) => setFoodId(e.target.value)}
          required
          className={inputClasses}
        >
          <option value="" disabled>
            Select food
          </option>
          {foodsByCategory.map(({ category, foods }) => (
            <optgroup key={category} label={FOOD_CATEGORY_LABELS[category]}>
              {foods.map((food) => (
                <option key={food.id} value={food.id}>
                  {food.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <select
          name="mealType"
          defaultValue="BREAKFAST"
          className={inputClasses}
        >
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {MEAL_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          name="grams"
          type="number"
          step="0.1"
          min="0"
          placeholder="grams"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          required
          className={`w-24 ${inputClasses}`}
        />
        <span className="text-sm text-ink-muted">g</span>
        {preview && (
          <span className="text-sm text-ink-muted">
            → {preview.calories.toFixed(0)} kcal, {preview.protein.toFixed(1)}{" "}
            g protein
          </span>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="ml-auto rounded-xl bg-sage px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Log
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
