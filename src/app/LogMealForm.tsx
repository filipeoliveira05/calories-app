"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { logMeal } from "./actions";

type Food = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
};

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const;

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
      <p className="mb-6 text-sm text-zinc-500">
        You don&apos;t have any foods yet. Add some on the{" "}
        <a href="/foods" className="underline">
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
      className="mb-6 flex flex-col gap-2 rounded-lg border border-black/10 p-3 dark:border-white/10"
    >
      <div className="grid grid-cols-2 gap-2">
        <select
          name="foodId"
          value={foodId}
          onChange={(e) => setFoodId(e.target.value)}
          required
          className="rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
        >
          <option value="" disabled>
            Select food
          </option>
          {foods.map((food) => (
            <option key={food.id} value={food.id}>
              {food.name}
            </option>
          ))}
        </select>
        <select
          name="mealType"
          defaultValue="SNACK"
          className="rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
        >
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type[0] + type.slice(1).toLowerCase()}
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
          className="w-28 rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
        />
        <span className="text-sm text-zinc-500">g</span>
        {preview && (
          <span className="text-sm text-zinc-500">
            → {preview.calories.toFixed(0)} kcal, {preview.protein.toFixed(1)}{" "}
            g protein
          </span>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="ml-auto rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Log
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
