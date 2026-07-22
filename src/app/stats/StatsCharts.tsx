"use client";

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

export function StatsCharts({ data }: { data: WeekPoint[] }) {
  return (
    <div>
      <Chart title="Weekly avg calories" data={data} dataKey="calories" color="var(--color-sage)" unit="kcal" />
      <Chart title="Weekly avg protein" data={data} dataKey="protein" color="var(--color-terracotta)" unit="g" />
      <Chart title="Weekly avg weight" data={data} dataKey="weight" color="var(--color-gold)" unit="kg" />
    </div>
  );
}
