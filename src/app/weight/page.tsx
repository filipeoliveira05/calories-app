import { prisma } from "@/lib/prisma";
import { groupByWeek } from "@/lib/weeks";
import { LogWeightForm } from "./LogWeightForm";
import { WeightEntryRow } from "./WeightEntryRow";
import { WeeklyAverageRow } from "./WeeklyAverageRow";

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
      days: weekEntries.map((e) => ({ id: e.id, date: e.date, weightKg: e.weightKg })),
    }))
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

  const trendDelta =
    weeklyAverages.length >= 2
      ? weeklyAverages[0].average - weeklyAverages[1].average
      : null;

  const latestWeightKg = entries[0]?.weightKg ?? 0;

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Weight</h1>
      <p className="mb-5 text-sm text-ink-muted">Morning weigh-ins and weekly trend.</p>

      <LogWeightForm />

      {weeklyAverages.length > 0 && (
        <div className="mb-5 rounded-2xl bg-surface-raised p-3 shadow-sm">
          <div className="mb-1 flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-ink-muted">Weekly average</h2>
            {trendDelta !== null && (
              <span className="text-xs font-semibold tabular-nums text-gold">
                {Math.abs(trendDelta) < 0.005
                  ? "— 0.00 kg"
                  : trendDelta > 0
                    ? `▲ +${trendDelta.toFixed(2)} kg`
                    : `▼ ${trendDelta.toFixed(2)} kg`}
              </span>
            )}
          </div>
          {weeklyAverages.map((w) => (
            <WeeklyAverageRow
              key={w.weekStart.toISOString()}
              weekStart={w.weekStart}
              average={w.average}
              days={w.days}
              latestWeightKg={latestWeightKg}
            />
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
