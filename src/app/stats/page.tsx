import { prisma } from "@/lib/prisma";
import { getWeekStart, formatWeekLabel, groupByWeek } from "@/lib/weeks";
import { StatsCharts } from "./StatsCharts";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [mealEntries, weightEntries] = await Promise.all([
    prisma.mealEntry.findMany({ orderBy: { date: "asc" } }),
    prisma.weightEntry.findMany({ orderBy: { date: "asc" } }),
  ]);

  // Sum meal entries per day first, so weeks average *daily totals*
  // (matches the Excel behavior), not raw per-entry values.
  const dailyTotals = new Map<
    string,
    { date: Date; calories: number; protein: number }
  >();
  for (const entry of mealEntries) {
    const key = entry.date.toISOString();
    const calories = (entry.caloriesPer100g * entry.grams) / 100;
    const protein = (entry.proteinPer100g * entry.grams) / 100;
    const existing = dailyTotals.get(key);
    if (existing) {
      existing.calories += calories;
      existing.protein += protein;
    } else {
      dailyTotals.set(key, { date: entry.date, calories, protein });
    }
  }

  const mealWeekGroups = groupByWeek([...dailyTotals.values()], (d) => d.date);
  const weightWeekGroups = groupByWeek(weightEntries, (e) => e.date);

  const allWeekKeys = new Set([
    ...mealWeekGroups.keys(),
    ...weightWeekGroups.keys(),
  ]);

  const weeklyStats = [...allWeekKeys]
    .map((weekKey) => {
      const days = mealWeekGroups.get(weekKey) ?? [];
      const weights = weightWeekGroups.get(weekKey) ?? [];
      return {
        weekStart: new Date(weekKey),
        avgCalories:
          days.length > 0
            ? days.reduce((s, d) => s + d.calories, 0) / days.length
            : null,
        avgProtein:
          days.length > 0
            ? days.reduce((s, d) => s + d.protein, 0) / days.length
            : null,
        avgWeight:
          weights.length > 0
            ? weights.reduce((s, w) => s + w.weightKg, 0) / weights.length
            : null,
      };
    })
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

  const chartData = weeklyStats.map((w) => ({
    week: formatWeekLabel(w.weekStart),
    calories: w.avgCalories !== null ? Math.round(w.avgCalories) : null,
    protein: w.avgProtein !== null ? Math.round(w.avgProtein * 10) / 10 : null,
    weight: w.avgWeight !== null ? Math.round(w.avgWeight * 10) / 10 : null,
  }));

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Stats</h1>
      <p className="mb-5 text-sm text-ink-muted">Weekly averages against your goals.</p>
      {chartData.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Log some meals and weight entries to see weekly trends here.
        </p>
      ) : (
        <StatsCharts data={chartData} />
      )}
    </div>
  );
}
