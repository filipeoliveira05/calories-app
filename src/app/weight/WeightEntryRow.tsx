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
    <div className="flex items-center justify-between border-b border-black/5 py-2 text-sm dark:border-white/5">
      <span className="text-zinc-500">{date}</span>
      <div className="flex items-center gap-3">
        <span className="font-medium">{weightKg.toFixed(1)} kg</span>
        <button
          onClick={() => startTransition(() => deleteWeightEntry(id))}
          disabled={isPending}
          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
