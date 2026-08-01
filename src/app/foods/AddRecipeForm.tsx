"use client";

import { useRef, useState, useTransition } from "react";
import { createRecipe } from "./actions";
import { IngredientRows, ingredientTotals, type Food, type IngredientDraft } from "./IngredientRows";
import { MealTypePicker } from "./MealTypePicker";

const inputClasses =
  "w-full rounded-xl border border-hairline bg-bg px-2.5 py-2 text-sm text-ink focus:border-sage focus:outline-none";

export function AddRecipeForm({ foods }: { foods: Food[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([]);

  const totals = ingredientTotals(foods, ingredients);
  const hasPreview = ingredients.some((i) => i.foodId && Number(i.amount) > 0);

  function resetForm() {
    formRef.current?.reset();
    setIngredients([]);
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        setSuccess(null);
        if (ingredients.some((i) => !i.foodId)) {
          setError("Select a food for every ingredient");
          return;
        }
        startTransition(async () => {
          try {
            const name = formData.get("name");
            await createRecipe(formData);
            resetForm();
            setSuccess(
              typeof name === "string" && name ? `"${name}" added` : "Recipe added"
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add recipe");
          }
        });
      }}
      className="mb-5 flex flex-col gap-3 rounded-2xl bg-surface-raised p-4 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">Recipe name</label>
        <input name="name" placeholder="e.g. Breakfast bowl" required className={inputClasses} />
      </div>

      <MealTypePicker />

      <IngredientRows foods={foods} ingredients={ingredients} onChange={setIngredients} />

      <div className="flex items-center gap-3">
        {hasPreview && (
          <span className="text-sm text-ink-muted">
            → {totals.calories.toFixed(0)} kcal, {totals.protein.toFixed(1)} g protein
          </span>
        )}
        {ingredients.length > 0 && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-danger hover:bg-terracotta-soft"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || ingredients.length === 0}
          className="ml-auto rounded-xl bg-sage px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add recipe
        </button>
      </div>

      {error && (
        <p className="flex items-start gap-1.5 text-xs text-danger">
          <span className="whitespace-pre-line">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss"
            className="shrink-0 font-medium text-danger hover:opacity-70"
          >
            ×
          </button>
        </p>
      )}
      {success && (
        <p className="flex items-start gap-1.5 text-xs text-sage">
          <span className="whitespace-pre-line">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            aria-label="Dismiss"
            className="shrink-0 font-medium text-sage hover:opacity-70"
          >
            ×
          </button>
        </p>
      )}
    </form>
  );
}
