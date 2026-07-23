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
  return (
    <div className="mb-4 rounded-2xl bg-surface-raised p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-semibold text-ink-muted">{title}</h2>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }} domain={["auto", "auto"]} />
            <Tooltip
              formatter={(value) => [`${value} ${unit}`, title]}
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

export function StatsCharts({ data }: { data: WeekPoint[] }) {
  const minDate = data[0].weekStart;
  const maxDate = data[data.length - 1].weekStart;
  const [from, setFrom] = useState(minDate);
  const [to, setTo] = useState(maxDate);

  const filtered = useMemo(
    () => data.filter((d) => d.weekStart >= from && d.weekStart <= to),
    [data, from, to],
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <label className="flex items-center gap-1.5 text-ink-muted">
          From
          <input
            type="date"
            value={from}
            min={minDate}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
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
            onChange={(e) => setTo(e.target.value)}
            className={inputClasses}
          />
        </label>
        {(from !== minDate || to !== maxDate) && (
          <button
            onClick={() => {
              setFrom(minDate);
              setTo(maxDate);
            }}
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
