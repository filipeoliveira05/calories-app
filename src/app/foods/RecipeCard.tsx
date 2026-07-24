"use client";

import { useState, useTransition } from "react";
import { updateRecipe, deleteRecipe } from "./actions";
import { IngredientRows, ingredientTotals, type Food, type IngredientDraft } from "./IngredientRows";

export type RecipeIngredient = {
  id: string;
  foodId: string;
  foodName: string;
  grams: number | null;
  quantity: number | null;
  unitLabel: string | null;
};

export type Recipe = {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
};

const inputClasses =
  "w-full rounded-xl border border-hairline bg-bg px-2.5 py-2 text-sm text-ink focus:border-sage focus:outline-none";

export function RecipeCard({ recipe, foods }: { recipe: Recipe; foods: Food[] }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() =>
    recipe.ingredients.map((ri) => ({
      key: ri.id,
      foodId: ri.foodId,
      amount: String(ri.grams ?? ri.quantity ?? ""),
    })),
  );

  const foodMap = new Map(foods.map((f) => [f.id, f]));
  const displayTotals = ingredientTotals(
    foods,
    recipe.ingredients.map((ri) => ({ foodId: ri.foodId, amount: String(ri.grams ?? ri.quantity ?? "") })),
  );

  const editTotals = ingredientTotals(foods, ingredients);
  const hasEditPreview = ingredients.some((i) => i.foodId && Number(i.amount) > 0);

  if (editing) {
    return (
      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            try {
              await updateRecipe(recipe.id, formData);
              setEditing(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to update recipe");
            }
          });
        }}
        className="mb-3 flex flex-col gap-3 rounded-2xl bg-surface-raised p-4 shadow-sm"
      >
        <input name="name" defaultValue={recipe.name} required className={inputClasses} />
        <IngredientRows foods={foods} ingredients={ingredients} onChange={setIngredients} />
        <div className="flex items-center gap-3">
          {hasEditPreview && (
            <span className="text-sm text-ink-muted">
              → {editTotals.calories.toFixed(0)} kcal, {editTotals.protein.toFixed(1)} g protein
            </span>
          )}
          <button
            type="submit"
            disabled={isPending || ingredients.length === 0}
            className="ml-auto rounded-lg bg-sage px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </form>
    );
  }

  return (
    <div className="mb-3 rounded-2xl bg-surface-raised p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{recipe.name}</p>
          <ul className="mt-0.5 flex flex-col gap-0.5 text-xs text-ink-muted">
            {recipe.ingredients.map((ri) => {
              const food = foodMap.get(ri.foodId);
              const amount = food?.isLoggedByUnit
                ? `${ri.quantity} ${food.unitLabel ?? "unit"}`
                : `${ri.grams}g`;
              return (
                <li key={ri.id} className="truncate">
                  º {ri.foodName} <span className="tabular-nums"> - {amount}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-1 text-sm text-ink-muted">
            → {displayTotals.calories.toFixed(0)} kcal, {displayTotals.protein.toFixed(1)} g protein
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted hover:bg-surface"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${recipe.name}"?`)) {
                startTransition(() => deleteRecipe(recipe.id));
              }
            }}
            disabled={isPending}
            className="rounded-lg px-2 py-1 text-xs font-medium text-danger hover:bg-terracotta-soft disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
