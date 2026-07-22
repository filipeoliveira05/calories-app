"use client";

import { useTransition } from "react";
import { deleteWeightEntry } from "./actions";

export function WeightEntryRow({
  id,
  date,
  weightKg,
}: {
  id: string;
  date: string;
  weightKg: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between border-b border-hairline px-1 py-2 text-sm last:border-b-0">
      <span className="text-ink-muted">{date}</span>
      <div className="flex items-center gap-3">
        <span className="font-medium tabular-nums">{weightKg.toFixed(2)} kg</span>
        <button
          onClick={() => startTransition(() => deleteWeightEntry(id))}
          disabled={isPending}
          className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
