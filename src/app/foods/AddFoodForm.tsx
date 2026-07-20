"use client";

import { useRef, useState, useTransition } from "react";
import { createFood } from "./actions";

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
      className="mb-6 grid grid-cols-[1fr_5rem_5rem_auto] items-end gap-2"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Food name</label>
        <input
          name="name"
          placeholder="e.g. Rice"
          required
          className="rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">kcal/100g</label>
        <input
          name="caloriesPer100g"
          type="number"
          step="0.1"
          min="0"
          required
          className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">protein/100g</label>
        <input
          name="proteinPer100g"
          type="number"
          step="0.1"
          min="0"
          required
          className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Add
      </button>
      {error && (
        <p className="col-span-4 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
