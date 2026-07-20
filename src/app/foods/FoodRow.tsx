"use client";

import { useState, useTransition } from "react";
import { updateFood, deleteFood } from "./actions";

type Food = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
};

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
        className="grid grid-cols-[1fr_5rem_5rem_auto] items-center gap-2 border-b border-black/5 py-2 dark:border-white/5"
      >
        <input
          name="name"
          defaultValue={food.name}
          required
          className="rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
        />
        <input
          name="caloriesPer100g"
          type="number"
          step="0.1"
          min="0"
          defaultValue={food.caloriesPer100g}
          required
          className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
        />
        <input
          name="proteinPer100g"
          type="number"
          step="0.1"
          min="0"
          defaultValue={food.proteinPer100g}
          required
          className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
        />
        <div className="flex gap-1">
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-zinc-900 px-2 py-1 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="col-span-4 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_5rem_5rem_auto] items-center gap-2 border-b border-black/5 py-2 text-sm dark:border-white/5">
      <span className="font-medium">{food.name}</span>
      <span className="text-zinc-600 dark:text-zinc-400">
        {food.caloriesPer100g} kcal
      </span>
      <span className="text-zinc-600 dark:text-zinc-400">
        {food.proteinPer100g} g
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => setEditing(true)}
          className="rounded px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
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
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
