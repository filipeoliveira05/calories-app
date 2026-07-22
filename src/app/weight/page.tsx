import { prisma } from "@/lib/prisma";
import { getWeekStart, formatWeekLabel, groupByWeek } from "@/lib/weeks";
import { LogWeightForm } from "./LogWeightForm";
import { WeightEntryRow } from "./WeightEntryRow";

export const dynamic = "force-dynamic";

export default async function WeightPage() {
  const entries = await prisma.weightEntry.findMany({
    orderBy: { date: "desc" },
  });

  const weekGroups = groupByWeek(entries, (e) => e.date);
  const weeklyAverages = [...weekGroups.entries()]
    .map(([weekKey, weekEntries]) => ({
      weekStart: new Date(weekKey),
      average:
        weekEntries.reduce((sum, e) => sum + e.weightKg, 0) /
        weekEntries.length,
      count: weekEntries.length,
    }))
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Weight</h1>
      <p className="mb-5 text-sm text-ink-muted">Morning weigh-ins and weekly trend.</p>

      <LogWeightForm />

      {weeklyAverages.length > 0 && (
        <div className="mb-5 rounded-2xl bg-surface-raised p-3 shadow-sm">
          <h2 className="mb-1 px-1 text-xs font-semibold text-ink-muted">
            Weekly average
          </h2>
          {weeklyAverages.map((w) => (
            <div
              key={w.weekStart.toISOString()}
              className="flex items-center justify-between border-b border-hairline px-1 py-2 text-sm last:border-b-0"
            >
              <span className="text-ink-muted">{formatWeekLabel(w.weekStart)}</span>
              <span className="font-medium tabular-nums">
                {w.average.toFixed(1)} kg{" "}
                <span className="text-xs text-ink-muted">
                  ({w.count} {w.count === 1 ? "entry" : "entries"})
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-1 px-1 text-xs font-semibold text-ink-muted">History</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-ink-muted">No weight entries yet.</p>
      ) : (
        <div className="rounded-2xl bg-surface-raised p-3 shadow-sm">
          {entries.map((entry) => (
            <WeightEntryRow
              key={entry.id}
              id={entry.id}
              date={entry.date.toISOString().slice(0, 10)}
              weightKg={entry.weightKg}
            />
          ))}
        </div>
      )}
    </div>
  );
}
