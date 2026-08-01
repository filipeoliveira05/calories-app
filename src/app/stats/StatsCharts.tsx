"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type WeekPoint = {
  week: string;
  weekStart: string;
  calories: number | null;
  protein: number | null;
  weight: number | null;
};

const LONG_RANGE_DAYS = 180;

/**
 * A tight Y-axis domain: a small buffer around the visible data instead of
 * Recharts' "auto" domain, which can pad out to a much wider round number
 * (e.g. down to 100 when the data only dips to 120). Tick placement itself
 * is left to Recharts.
 */
function tightDomain(dataMin: number, dataMax: number): [number, number] {
  const buffer = Math.max((dataMax - dataMin) * 0.05, 1);
  return [Math.floor(dataMin - buffer), Math.ceil(dataMax + buffer)];
}

function formatTick(iso: string, longRange: boolean, multiYear: boolean): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (longRange) {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: multiYear ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

function Chart({
  title,
  data,
  dataKey,
  color,
  unit,
}: {
  title: string;
  data: WeekPoint[];
  dataKey: keyof WeekPoint;
  color: string;
  unit: string;
}) {
  const maxTicks = 5;
  const tickCount = Math.min(maxTicks, data.length);
  const tickIndices = new Set(
    tickCount <= 1
      ? [0]
      : Array.from({ length: tickCount }, (_, i) =>
          Math.round((i * (data.length - 1)) / (tickCount - 1)),
        ),
  );
  const ticks = [...tickIndices].sort((a, b) => a - b).map((i) => data[i].weekStart);

  const firstDate = new Date(`${data[0].weekStart}T00:00:00Z`);
  const lastDate = new Date(`${data[data.length - 1].weekStart}T00:00:00Z`);
  const rangeDays = (lastDate.getTime() - firstDate.getTime()) / 86_400_000;
  const longRange = rangeDays > LONG_RANGE_DAYS;
  const multiYear = firstDate.getUTCFullYear() !== lastDate.getUTCFullYear();
  const weekByStart = new Map(data.map((d) => [d.weekStart, d.week]));

  const values = data
    .map((d) => d[dataKey])
    .filter((v): v is number => v !== null);
  const dataMin = values.length > 0 ? Math.min(...values) : 0;
  const dataMax = values.length > 0 ? Math.max(...values) : 0;
  const yDomain = tightDomain(dataMin, dataMax);

  return (
    <div className="mb-4 rounded-2xl bg-surface-raised p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-semibold text-ink-muted">{title}</h2>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 24, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
            <XAxis
              dataKey="weekStart"
              tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
              ticks={ticks}
              interval={0}
              tickMargin={8}
              tickFormatter={(value) => formatTick(value, longRange, multiYear)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
              domain={yDomain}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value) => [`${value} ${unit}`, title]}
              labelFormatter={(label) => weekByStart.get(label) ?? label}
              contentStyle={{
                fontSize: 12,
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-hairline)",
                borderRadius: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              connectNulls
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const inputClasses =
  "rounded-xl border border-hairline bg-bg px-2 py-1 text-sm text-ink focus:border-sage focus:outline-none";

const RANGE_PRESETS = [
  { label: "Last month", days: 30 },
  { label: "Last 3 months", days: 90 },
  { label: "Last year", days: 365 },
];

function daysAgo(days: number, minDate: string): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  const iso = d.toISOString().slice(0, 10);
  return iso < minDate ? minDate : iso;
}

function clampToRange(value: string | undefined, minDate: string, maxDate: string): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  if (value < minDate || value > maxDate) return null;
  return value;
}

export function StatsCharts({
  data,
  initialFrom,
  initialTo,
}: {
  data: WeekPoint[];
  initialFrom?: string;
  initialTo?: string;
}) {
  const minDate = data[0].weekStart;
  const maxDate = data[data.length - 1].weekStart;
  const [from, setFrom] = useState(
    () => clampToRange(initialFrom, minDate, maxDate) ?? minDate,
  );
  const [to, setTo] = useState(
    () => clampToRange(initialTo, minDate, maxDate) ?? maxDate,
  );

  const filtered = useMemo(
    () => data.filter((d) => d.weekStart >= from && d.weekStart <= to),
    [data, from, to],
  );

  function updateRange(newFrom: string, newTo: string) {
    setFrom(newFrom);
    setTo(newTo);
    // Filtering happens client-side from `data`, so the URL only needs to
    // reflect the selection for reload/share purposes — updating it via the
    // History API directly (instead of next/navigation's router) avoids
    // triggering a full server round-trip and Prisma re-query on every
    // range change.
    const url =
      newFrom === minDate && newTo === maxDate
        ? "/stats"
        : `/stats?from=${newFrom}&to=${newTo}`;
    window.history.replaceState(null, "", url);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {RANGE_PRESETS.map((preset) => {
          const presetFrom = daysAgo(preset.days, minDate);
          const isActive = from === presetFrom && to === maxDate;
          return (
            <button
              key={preset.label}
              onClick={() => {
                if (isActive) {
                  updateRange(minDate, maxDate);
                } else {
                  updateRange(presetFrom, maxDate);
                }
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                isActive ? "bg-sage text-white" : "bg-surface-raised text-ink-muted"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <label className="flex items-center gap-1.5 text-ink-muted">
          From
          <input
            type="date"
            value={from}
            min={minDate}
            max={to}
            onChange={(e) => e.target.value && updateRange(e.target.value, to)}
            className={inputClasses}
          />
        </label>
        <label className="flex items-center gap-1.5 text-ink-muted">
          To
          <input
            type="date"
            value={to}
            min={from}
            max={maxDate}
            onChange={(e) => e.target.value && updateRange(from, e.target.value)}
            className={inputClasses}
          />
        </label>
        {(from !== minDate || to !== maxDate) && (
          <button
            onClick={() => updateRange(minDate, maxDate)}
            className="text-xs font-medium text-ink-muted hover:underline"
          >
            Reset
          </button>
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-ink-muted">No data in this range.</p>
      ) : (
        <>
          <Chart title="Weekly avg calories" data={filtered} dataKey="calories" color="var(--color-sage)" unit="kcal" />
          <Chart title="Weekly avg protein" data={filtered} dataKey="protein" color="var(--color-terracotta)" unit="g" />
          <Chart title="Weekly avg weight" data={filtered} dataKey="weight" color="var(--color-gold)" unit="kg" />
        </>
      )}
    </div>
  );
}
