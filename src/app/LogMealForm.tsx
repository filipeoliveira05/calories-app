"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { logMeal, logRecipe } from "./actions";
import { QuickAddFood } from "./QuickAddFood";
import { SearchableSelect } from "@/components/SearchableSelect";
import { MEAL_TYPES, MEAL_TYPE_LABELS, getDefaultMealType } from "@/lib/mealTypes";
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from "@/lib/foodCategories";
import type { FoodCategory, MealType } from "@/generated/prisma/enums";

type Food = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  category: FoodCategory;
  isLoggedByUnit: boolean;
  unitLabel: string | null;
  gramsPerUnit: number | null;
};

type RecipeIngredient = {
  id: string;
  foodName: string;
  grams: number | null;
  quantity: number | null;
  unitLabel: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  isLoggedByUnit: boolean;
  gramsPerUnit: number | null;
};

type Recipe = {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
};

const inputClasses =
  "rounded-xl border border-hairline bg-bg px-3 py-2.5 text-sm text-ink focus:border-sage focus:outline-none";

function recipeTotals(recipe: Recipe) {
  return recipe.ingredients.reduce(
    (acc, ri) => {
      const grams = ri.isLoggedByUnit ? (ri.quantity ?? 0) * (ri.gramsPerUnit ?? 0) : (ri.grams ?? 0);
      acc.calories += (ri.caloriesPer100g * grams) / 100;
      acc.protein += (ri.proteinPer100g * grams) / 100;
      return acc;
    },
    { calories: 0, protein: 0 },
  );
}

export function LogMealForm({
  foods,
  recipes,
  date,
}: {
  foods: Food[];
  recipes: Recipe[];
  date: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"food" | "recipe">("food");
  const [foodId, setFoodId] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [amount, setAmount] = useState("");
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [addingFood, setAddingFood] = useState(false);

  // Optimistically shows a just-created food before the server-fetched `foods` prop
  // revalidates and includes it; cleared once that revalidation lands.
  const [createdFood, setCreatedFood] = useState<Food | null>(null);

  useEffect(() => {
    if (createdFood && foods.some((f) => f.id === createdFood.id)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCreatedFood(null);
    }
  }, [foods, createdFood]);

  useEffect(() => {
    if (createdFood) amountInputRef.current?.focus();
  }, [createdFood]);

  const allFoods = useMemo(
    () => (createdFood && !foods.some((f) => f.id === createdFood.id) ? [...foods, createdFood] : foods),
    [foods, createdFood],
  );

  useEffect(() => {
    // Client's clock isn't known during SSR; deferring to an effect avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMealType(getDefaultMealType());
  }, []);

  const selectedFood = useMemo(
    () => allFoods.find((f) => f.id === foodId) ?? null,
    [allFoods, foodId],
  );

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.id === recipeId) ?? null,
    [recipes, recipeId],
  );

  const foodsByCategory = useMemo(() => {
    return FOOD_CATEGORIES.map((category) => ({
      category,
      foods: allFoods.filter((f) => f.category === category),
    })).filter((group) => group.foods.length > 0);
  }, [allFoods]);

  const foodItems = useMemo(
    () =>
      foodsByCategory.flatMap(({ category, foods }) =>
        foods.map((food) => ({
          id: food.id,
          label: food.name,
          groupLabel: FOOD_CATEGORY_LABELS[category],
        })),
      ),
    [foodsByCategory],
  );

  const recipeItems = useMemo(
    () => recipes.map((recipe) => ({ id: recipe.id, label: recipe.name })),
    [recipes],
  );

  const amountNum = Number(amount);
  const grams =
    selectedFood?.isLoggedByUnit && selectedFood.gramsPerUnit
      ? amountNum * selectedFood.gramsPerUnit
      : amountNum;
  const foodPreview =
    selectedFood && Number.isFinite(grams) && grams > 0
      ? {
          calories: (selectedFood.caloriesPer100g * grams) / 100,
          protein: (selectedFood.proteinPer100g * grams) / 100,
        }
      : null;
  const recipePreview = selectedRecipe ? recipeTotals(selectedRecipe) : null;

  function resetForm() {
    setFoodId("");
    setRecipeId("");
    setAmount("");
    setMealType(getDefaultMealType());
  }

  if (allFoods.length === 0) {
    return (
      <div className="mb-6 flex flex-col gap-2 rounded-2xl bg-surface-raised p-4 text-sm text-ink-muted shadow-sm">
        <p>
          You don&apos;t have any foods yet. Add one below, or on the{" "}
          <a href="/foods" className="text-sage underline">
            Foods
          </a>{" "}
          page.
        </p>
        <QuickAddFood
          onCreated={(food) => {
            setCreatedFood(food);
            setFoodId(food.id);
          }}
        />
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        if (mode === "food" && !foodId) {
          setError("Select a food");
          return;
        }
        if (mode === "recipe" && !recipeId) {
          setError("Select a recipe");
          return;
        }
        const formData = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          try {
            if (mode === "recipe") {
              await logRecipe(formData);
            } else {
              await logMeal(formData);
            }
            resetForm();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to log meal");
          }
        });
      }}
      className="mb-6 flex flex-col gap-2.5 rounded-2xl bg-surface-raised p-4 shadow-sm"
    >
      <input type="hidden" name="date" value={date} />
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setMode("food")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            mode === "food" ? "bg-sage text-white" : "bg-bg text-ink-muted"
          }`}
        >
          Food
        </button>
        <button
          type="button"
          onClick={() => setMode("recipe")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            mode === "recipe" ? "bg-sage text-white" : "bg-bg text-ink-muted"
          }`}
        >
          Recipe
        </button>
      </div>

      {mode === "recipe" && recipes.length === 0 ? (
        <p className="text-sm text-ink-muted">
          You don&apos;t have any recipes yet. Add one on the{" "}
          <a href="/foods" className="text-sage underline">
            Foods
          </a>{" "}
          page.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {mode === "food" ? (
              <SearchableSelect
                name="foodId"
                items={foodItems}
                value={foodId}
                onChange={(id) => {
                  setFoodId(id);
                  setAmount("");
                  if (id) requestAnimationFrame(() => amountInputRef.current?.focus());
                }}
                placeholder="Search food..."
                className={inputClasses}
              />
            ) : (
              <SearchableSelect
                name="recipeId"
                items={recipeItems}
                value={recipeId}
                onChange={setRecipeId}
                placeholder="Search recipe..."
                className={inputClasses}
              />
            )}
            <select
              name="mealType"
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className={inputClasses}
            >
              {MEAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {MEAL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {mode === "food" && (
            <QuickAddFood
              onCreated={(food) => {
                setCreatedFood(food);
                setFoodId(food.id);
                setAmount("");
              }}
              onExpandedChange={setAddingFood}
            />
          )}

          {mode === "food" ? (
            !addingFood && (
              <div className="flex items-center gap-2">
                <input
                  ref={amountInputRef}
                  name={selectedFood?.isLoggedByUnit ? "quantity" : "grams"}
                  type="number"
                  step={selectedFood?.isLoggedByUnit ? "0.5" : "1"}
                  min="0"
                  placeholder={selectedFood?.isLoggedByUnit ? "qty" : "grams"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className={`w-24 ${inputClasses}`}
                />
                <span className="text-sm text-ink-muted">
                  {selectedFood?.isLoggedByUnit
                    ? (selectedFood.unitLabel ?? "unit")
                    : "g"}
                </span>
                {foodPreview && (
                  <span className="text-sm text-ink-muted">
                    → {foodPreview.calories.toFixed(0)} kcal, {foodPreview.protein.toFixed(1)}{" "}
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
            )
          ) : (
            <div className="flex flex-col gap-2">
              {selectedRecipe && (
                <ul className="flex flex-col gap-0.5 text-xs text-ink-muted">
                  {selectedRecipe.ingredients.map((ri) => (
                    <li key={ri.id}>
                      - {ri.foodName}{" "}
                      <span className="tabular-nums">
                        {ri.isLoggedByUnit ? `${ri.quantity} ${ri.unitLabel ?? "unit"}` : `${ri.grams}g`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2">
                {recipePreview && (
                  <span className="text-sm text-ink-muted">
                    → {recipePreview.calories.toFixed(0)} kcal, {recipePreview.protein.toFixed(1)}{" "}
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
            </div>
          )}
        </>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
