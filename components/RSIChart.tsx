"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TechnicalPoint } from "@/lib/indicators";

interface RSIChartProps {
  data: TechnicalPoint[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function RSIChart({ data }: RSIChartProps) {
  const latest = data[data.length - 1];

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">RSI（14 日）</h3>
        {latest && latest.rsi !== null && (
          <span className="text-xs text-gray-400">
            RSI <span className="text-sky-400">{latest.rsi.toFixed(1)}</span>
          </span>
        )}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              minTickGap={30}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} />
            <ReferenceLine y={70} stroke="#4b5563" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#4b5563" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid #374151", fontSize: 12 }}
              labelFormatter={(label) => new Date(String(label)).toLocaleDateString("zh-TW")}
              formatter={(value) => [Number(value).toFixed(1), "RSI"]}
            />
            <Line type="monotone" dataKey="rsi" stroke="#38bdf8" dot={false} strokeWidth={1.5} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
