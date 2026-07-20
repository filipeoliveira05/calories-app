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
      <h1 className="mb-4 text-xl font-semibold">Weight</h1>

      <LogWeightForm />

      {weeklyAverages.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-zinc-500">
            Weekly average
          </h2>
          {weeklyAverages.map((w) => (
            <div
              key={w.weekStart.toISOString()}
              className="flex items-center justify-between border-b border-black/5 py-2 text-sm dark:border-white/5"
            >
              <span className="text-zinc-500">
                {formatWeekLabel(w.weekStart)}
              </span>
              <span className="font-medium">
                {w.average.toFixed(1)} kg{" "}
                <span className="text-xs text-zinc-400">
                  ({w.count} {w.count === 1 ? "entry" : "entries"})
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-2 text-sm font-medium text-zinc-500">History</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-zinc-500">No weight entries yet.</p>
      ) : (
        <div>
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
