/** Returns the Monday (UTC midnight) of the week containing `date`. */
export function getWeekStart(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const sameYear = weekStart.getUTCFullYear() === weekEnd.getUTCFullYear();
  const fmt = (d: Date, withYear: boolean) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: withYear ? "numeric" : undefined,
      timeZone: "UTC",
    });
  return `${fmt(weekStart, !sameYear)} – ${fmt(weekEnd, true)}`;
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Average weight of the most recent complete week (Mon–Sun fully in the
 * past). Falls back to the latest week with any entries at all (even if
 * still in progress) when no complete week has data yet.
 */
export function getLatestWeeklyAverageWeight(
  entries: { date: Date; weightKg: number }[],
): number | null {
  if (entries.length === 0) return null;

  const groups = groupByWeek(entries, (e) => e.date);
  const today = new Date();

  const weekAverages = [...groups.entries()]
    .map(([weekKey, weights]) => {
      const weekStart = new Date(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
      return {
        weekStart,
        isComplete: weekEnd < today,
        average: weights.reduce((s, w) => s + w.weightKg, 0) / weights.length,
      };
    })
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

  const latestComplete = weekAverages.find((w) => w.isComplete);
  return (latestComplete ?? weekAverages[0]).average;
}

export function groupByWeek<T>(
  items: T[],
  getDate: (item: T) => Date,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = getWeekStart(getDate(item)).toISOString();
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
}
