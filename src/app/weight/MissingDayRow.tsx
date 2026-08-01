"use client";

import { useState, useTransition } from "react";
import { logWeightForDate } from "./actions";

const ADJUST_STEPS = [-0.25, -0.05, 0.05, 0.25];

export function MissingDayRow({
  date,
  label,
  defaultWeightKg,
}: {
  date: string;
  label: string;
  defaultWeightKg: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [pendingWeight, setPendingWeight] = useState(defaultWeightKg);
  const [error, setError] = useState<string | null>(null);

  function startAdding() {
    setPendingWeight(defaultWeightKg);
    setError(null);
    setIsAdding(true);
  }

  function save() {
    startTransition(async () => {
      try {
        await logWeightForDate(date, pendingWeight);
        setIsAdding(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to log weight");
      }
    });
  }

  if (isAdding) {
    return (
      <div className="flex flex-col gap-1.5 px-1 py-1 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-ink-muted">{label}</span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {ADJUST_STEPS.map((delta) => {
              const positive = delta > 0;
              const colorClasses = positive
                ? "border border-sage text-sage"
                : "border border-danger text-danger";
              return (
                <button
                  key={delta}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    setPendingWeight((w) => Math.max(0.05, Math.round((w + delta) * 100) / 100))
                  }
                  className={`rounded-lg px-2 py-0.5 text-xs font-medium tabular-nums ${colorClasses}`}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              );
            })}
            <input
              type="number"
              step="0.05"
              min="0"
              value={pendingWeight}
              onChange={(e) => setPendingWeight(Number(e.target.value))}
              className="w-20 rounded-lg border border-hairline bg-bg px-2 py-1 text-right tabular-nums focus:border-sage focus:outline-none"
            />
            <span className="text-ink-muted">kg</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isPending}
                className="rounded-lg bg-sage px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
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
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-1 py-1 text-xs">
      <span className="text-ink-muted">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-ink-muted">No entry</span>
        <button
          onClick={startAdding}
          disabled={isPending}
          className="font-medium text-sage hover:underline disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
