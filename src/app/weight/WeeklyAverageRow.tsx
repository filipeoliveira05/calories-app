"use client";

import { useState } from "react";
import { formatDayLabel, formatWeekLabel } from "@/lib/weeks";

export function WeeklyAverageRow({
  weekStart,
  average,
  days,
}: {
  weekStart: Date;
  average: number;
  days: { date: Date; weightKg: number }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const sortedDays = [...days].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="border-b border-hairline last:border-b-0">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-1 py-2 text-sm"
      >
        <span className="flex items-center gap-1.5 text-ink-muted">
          <span
            className={`transition-transform ${expanded ? "rotate-90" : ""}`}
            aria-hidden
          >
            ›
          </span>
          {formatWeekLabel(weekStart)}
        </span>
        <span className="font-medium tabular-nums">
          {average.toFixed(1)} kg{" "}
          <span className="text-xs text-ink-muted">
            ({sortedDays.length} {sortedDays.length === 1 ? "entry" : "entries"})
          </span>
        </span>
      </button>
      {expanded && (
        <div className="pb-2 pl-6">
          {sortedDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className="flex items-center justify-between px-1 py-1 text-xs"
            >
              <span className="text-ink-muted">{formatDayLabel(day.date)}</span>
              <span className="tabular-nums">{day.weightKg.toFixed(2)} kg</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
