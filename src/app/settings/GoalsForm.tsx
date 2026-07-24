"use client";

import { useState, useTransition } from "react";
import { saveGoals } from "./actions";

const inputClasses =
  "rounded-xl border border-hairline bg-bg px-3 py-2.5 text-sm text-ink focus:border-sage focus:outline-none";

const FORM_ID = "goals-form";

function GoalsFields({
  dailyCalorieGoal,
  dailyProteinGoal,
  action,
}: {
  dailyCalorieGoal: number | null;
  dailyProteinGoal: number | null;
  action: (formData: FormData) => void;
}) {
  return (
    <form id={FORM_ID} action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">Daily calorie goal</label>
        <input
          name="dailyCalorieGoal"
          type="number"
          step="1"
          min="0"
          defaultValue={dailyCalorieGoal ?? ""}
          required
          className={inputClasses}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">Daily protein goal (g)</label>
        <input
          name="dailyProteinGoal"
          type="number"
          step="1"
          min="0"
          defaultValue={dailyProteinGoal ?? ""}
          required
          className={inputClasses}
        />
      </div>
    </form>
  );
}

export function GoalsForm({
  formVersion,
  dailyCalorieGoal,
  dailyProteinGoal,
}: {
  formVersion: string;
  dailyCalorieGoal: number | null;
  dailyProteinGoal: number | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex max-w-xs flex-col gap-3 rounded-2xl bg-surface-raised p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-ink">Set goals directly</h2>
      <GoalsFields
        key={formVersion}
        dailyCalorieGoal={dailyCalorieGoal}
        dailyProteinGoal={dailyProteinGoal}
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
      />
      <button
        type="submit"
        form={FORM_ID}
        disabled={isPending}
        className="rounded-xl bg-sage px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        Save
      </button>
      {saved && !error && <p className="text-xs text-sage">Saved.</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
