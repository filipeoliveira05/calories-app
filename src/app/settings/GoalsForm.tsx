"use client";

import { useState, useTransition } from "react";
import { saveGoals } from "./actions";

export function GoalsForm({
  dailyCalorieGoal,
  dailyProteinGoal,
}: {
  dailyCalorieGoal: number | null;
  dailyProteinGoal: number | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        setSaved(false);
        startTransition(async () => {
          try {
            await saveGoals(formData);
            setSaved(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save goals");
          }
        });
      }}
      className="flex max-w-xs flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Daily calorie goal</label>
        <input
          name="dailyCalorieGoal"
          type="number"
          step="1"
          min="0"
          defaultValue={dailyCalorieGoal ?? ""}
          required
          className="rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500">Daily protein goal (g)</label>
        <input
          name="dailyProteinGoal"
          type="number"
          step="1"
          min="0"
          defaultValue={dailyProteinGoal ?? ""}
          required
          className="rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Save
      </button>
      {saved && !error && (
        <p className="text-xs text-green-600 dark:text-green-400">Saved.</p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
