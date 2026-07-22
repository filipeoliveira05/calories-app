"use client";

import { useRef, useState, useTransition } from "react";
import { logWeight } from "./actions";

function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

const inputClasses =
  "rounded-xl border border-hairline bg-bg px-3 py-2.5 text-sm text-ink focus:border-sage focus:outline-none";

export function LogWeightForm() {
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
            await logWeight(formData);
            formRef.current?.reset();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to log weight");
          }
        });
      }}
      className="mb-5 flex items-end gap-2 rounded-2xl bg-surface-raised p-4 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">Date</label>
        <input
          name="date"
          type="date"
          defaultValue={todayISO()}
          max={todayISO()}
          required
          className={inputClasses}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">Weight (kg)</label>
        <input
          name="weightKg"
          type="number"
          step="0.05"
          min="0"
          required
          className={`w-28 ${inputClasses}`}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-sage px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        Save
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}
