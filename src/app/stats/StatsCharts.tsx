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
    <div className="mb-8">
      <h2 className="mb-2 text-sm font-medium text-zinc-500">{title}</h2>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
            <Tooltip
              formatter={(value) => [`${value} ${unit}`, title]}
              contentStyle={{ fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
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
      <Chart title="Weekly avg calories" data={data} dataKey="calories" color="#f97316" unit="kcal" />
      <Chart title="Weekly avg protein" data={data} dataKey="protein" color="#3b82f6" unit="g" />
      <Chart title="Weekly avg weight" data={data} dataKey="weight" color="#10b981" unit="kg" />
    </div>
  );
}
