"use client";

import { useState, useTransition } from "react";
import { updateFood, deleteFood } from "./actions";

type Food = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
};

const inputClasses =
  "w-full rounded-lg border border-hairline bg-bg px-2 py-1 text-sm text-ink focus:border-sage focus:outline-none";

export function FoodRow({ food }: { food: Food }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
        className="grid grid-cols-[1fr_4.5rem_4.5rem_auto] items-center gap-2 border-b border-hairline py-2 last:border-b-0"
      >
        <input name="name" defaultValue={food.name} required className={inputClasses} />
        <input
          name="caloriesPer100g"
          type="number"
          step="0.1"
          min="0"
          defaultValue={food.caloriesPer100g}
          required
          className={inputClasses}
        />
        <input
          name="proteinPer100g"
          type="number"
          step="0.1"
          min="0"
          defaultValue={food.proteinPer100g}
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
        {error && <p className="col-span-4 text-xs text-danger">{error}</p>}
      </form>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_4.5rem_4.5rem_auto] items-center gap-2 border-b border-hairline py-2 text-sm last:border-b-0">
      <span className="font-medium">{food.name}</span>
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
            if (confirm(`Delete "${food.name}"?`)) {
              startTransition(() => deleteFood(food.id));
            }
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
