"use client";

import { useState } from "react";
import { formatDayLabel, formatWeekLabel, getWeekDays, isWeekComplete } from "@/lib/weeks";
import { WeightEntryRow } from "./WeightEntryRow";
import { MissingDayRow } from "./MissingDayRow";

export function WeeklyAverageRow({
  weekStart,
  average,
  days,
  latestWeightKg,
}: {
  weekStart: Date;
  average: number;
  days: { id: string; date: Date; weightKg: number }[];
  latestWeightKg: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const entryByDate = new Map(
    days.map((day) => [day.date.toISOString().slice(0, 10), day]),
  );
  const today = new Date();
  const todayUTC = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const elapsedDays = getWeekDays(weekStart).filter((d) => d <= todayUTC);
  const complete = isWeekComplete(weekStart);
  const hasGaps = days.length < elapsedDays.length;

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
        <span className="flex items-center gap-2 font-medium tabular-nums">
          {average.toFixed(2)} kg{" "}
          <span
            className={`flex items-center gap-1 text-xs font-normal ${
              hasGaps && complete ? "text-gold" : "text-ink-muted"
            }`}
          >
            {hasGaps && complete && (
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
            )}
            {days.length}/{elapsedDays.length} days
          </span>
        </span>
      </button>
      {expanded && (
        <div className="pb-2 pl-6">
          {elapsedDays.map((date) => {
            const key = date.toISOString().slice(0, 10);
            const entry = entryByDate.get(key);
            if (entry) {
              return (
                <WeightEntryRow
                  key={key}
                  id={entry.id}
                  date={formatDayLabel(entry.date)}
                  weightKg={entry.weightKg}
                  compact
                />
              );
            }
            return (
              <MissingDayRow
                key={key}
                date={key}
                label={formatDayLabel(date)}
                defaultWeightKg={latestWeightKg}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
