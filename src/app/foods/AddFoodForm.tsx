"use client";

import { useRef, useState, useTransition } from "react";
import { createFood } from "./actions";
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from "@/lib/foodCategories";

const inputClasses =
  "w-full rounded-xl border border-hairline bg-bg px-2.5 py-2 text-sm text-ink focus:border-sage focus:outline-none";

export function AddFoodForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await createFood(formData);
            formRef.current?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add food");
          }
        });
      }}
      className="mb-5 grid grid-cols-[1fr_6.5rem_4.5rem_4.5rem_auto] items-end gap-2 rounded-2xl bg-surface-raised p-4 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">Food name</label>
        <input name="name" placeholder="e.g. Rice" required className={inputClasses} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">Category</label>
        <select name="category" defaultValue={FOOD_CATEGORIES[0]} className={inputClasses}>
          {FOOD_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {FOOD_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">kcal/100g</label>
        <input
          name="caloriesPer100g"
          type="number"
          step="0.1"
          min="0"
          required
          className={inputClasses}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">protein/100g</label>
        <input
          name="proteinPer100g"
          type="number"
          step="0.1"
          min="0"
          required
          className={inputClasses}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-sage px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Add
      </button>
      {error && <p className="col-span-5 text-xs text-danger">{error}</p>}
    </form>
  );
}
