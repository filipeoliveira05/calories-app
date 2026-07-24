"use client";

import { useState, useTransition } from "react";
import { updateFood, deleteFood } from "./actions";
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from "@/lib/foodCategories";
import type { FoodCategory } from "@/generated/prisma/enums";

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

const inputClasses =
  "w-full rounded-lg border border-hairline bg-bg px-2 py-1 text-sm text-ink focus:border-sage focus:outline-none";

export function FoodRow({ food }: { food: Food }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoggedByUnit, setIsLoggedByUnit] = useState(food.isLoggedByUnit);

  const caloriesDefault = food.isLoggedByUnit
    ? Math.round(((food.caloriesPer100g * food.gramsPerUnit!) / 100) * 100) / 100
    : food.caloriesPer100g;
  const proteinDefault = food.isLoggedByUnit
    ? Math.round(((food.proteinPer100g * food.gramsPerUnit!) / 100) * 100) / 100
    : food.proteinPer100g;

  if (editing) {
    return (
      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            try {
              await updateFood(food.id, formData);
              setEditing(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to update");
            }
          });
        }}
        className="grid grid-cols-[1fr_6.5rem_4.5rem_4.5rem_auto] items-center gap-2 border-b border-hairline py-2 last:border-b-0"
      >
        <input name="name" defaultValue={food.name} required className={`min-w-0 ${inputClasses}`} />
        <select name="category" defaultValue={food.category} className={inputClasses}>
          {FOOD_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {FOOD_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
        <input
          name="caloriesPer100g"
          type="number"
          step="0.1"
          min="0"
          defaultValue={caloriesDefault}
          required
          className={inputClasses}
        />
        <input
          name="proteinPer100g"
          type="number"
          step="0.1"
          min="0"
          defaultValue={proteinDefault}
          required
          className={inputClasses}
        />
        <div className="flex gap-1">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-sage px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted"
          >
            Cancel
          </button>
        </div>

        <label className="col-span-5 mt-1 flex items-center gap-2 text-xs text-ink-muted">
          <input
            type="checkbox"
            name="isLoggedByUnit"
            checked={isLoggedByUnit}
            onChange={(e) => setIsLoggedByUnit(e.target.checked)}
            className="accent-sage"
          />
          Logged by unit (e.g. &ldquo;1 yogurt&rdquo; instead of grams)
        </label>

        {isLoggedByUnit && (
          <div className="col-span-5 grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">Unit name</label>
              <input
                name="unitLabel"
                placeholder="e.g. yogurt"
                defaultValue={food.unitLabel ?? ""}
                required={isLoggedByUnit}
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-muted">Grams/unit</label>
              <input
                name="gramsPerUnit"
                type="number"
                step="0.1"
                min="0"
                defaultValue={food.gramsPerUnit ?? ""}
                required={isLoggedByUnit}
                className={inputClasses}
              />
            </div>
          </div>
        )}

        {error && <p className="col-span-5 text-xs text-danger">{error}</p>}
      </form>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_6.5rem_4.5rem_4.5rem_auto] items-center gap-2 border-b border-hairline py-2 text-sm last:border-b-0">
      <div className="min-w-0">
        <span className="block truncate font-medium">{food.name}</span>
        {food.isLoggedByUnit && (
          <span className="block truncate text-xs text-ink-muted">
            {food.gramsPerUnit}g / {food.unitLabel}
          </span>
        )}
        {deleteError && (
          <span className="block whitespace-pre-line text-xs text-danger">{deleteError}</span>
        )}
      </div>
      <span className="w-fit rounded-full bg-surface px-2 py-0.5 text-xs text-ink-muted">
        {FOOD_CATEGORY_LABELS[food.category]}
      </span>
      <span className="tabular-nums text-ink-muted">{food.caloriesPer100g} kcal</span>
      <span className="tabular-nums text-ink-muted">{food.proteinPer100g} g</span>
      <div className="flex gap-1">
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted hover:bg-surface"
        >
          Edit
        </button>
        <button
          onClick={() => {
            if (!confirm(`Delete "${food.name}"?`)) return;
            setDeleteError(null);
            startTransition(async () => {
              try {
                await deleteFood(food.id);
              } catch (e) {
                setDeleteError(e instanceof Error ? e.message : "Failed to delete");
              }
            });
          }}
          disabled={isPending}
          className="rounded-lg px-2 py-1 text-xs font-medium text-danger hover:bg-terracotta-soft disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
