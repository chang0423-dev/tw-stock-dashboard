"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MarginTradingPoint } from "@/types/stock";

interface MarginTradingChartProps {
  data: MarginTradingPoint[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatLots(n: number): string {
  return n.toLocaleString("zh-TW");
}

function formatChange(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toLocaleString("zh-TW")}`;
}

export function MarginTradingChart({ data }: MarginTradingChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-sm text-gray-500">
        查無此區間的融資融券資料
      </div>
    );
  }

  const latest = data[data.length - 1];

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-300">融資融券餘額（張）</h3>
        <div className="flex gap-4 text-xs text-gray-400">
          <span>
            融資餘額 <span className="text-sky-400">{formatLots(latest.marginBalance)}</span>{" "}
            <span className={latest.marginChange >= 0 ? "text-red-400" : "text-green-400"}>
              ({formatChange(latest.marginChange)})
            </span>
          </span>
          <span>
            融券餘額 <span className="text-amber-400">{formatLots(latest.shortBalance)}</span>{" "}
            <span className={latest.shortChange >= 0 ? "text-red-400" : "text-green-400"}>
              ({formatChange(latest.shortChange)})
            </span>
          </span>
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              minTickGap={30}
            />
            <YAxis yAxisId="margin" tick={{ fontSize: 10, fill: "#6b7280" }} />
            <YAxis
              yAxisId="short"
              orientation="right"
              tick={{ fontSize: 10, fill: "#6b7280" }}
            />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid #374151", fontSize: 12 }}
              labelFormatter={(label) => new Date(String(label)).toLocaleDateString("zh-TW")}
              formatter={(value, name) => [
                formatLots(Number(value)),
                name === "marginBalance" ? "融資餘額" : "融券餘額",
              ]}
            />
            <Legend
              formatter={(value) => (value === "marginBalance" ? "融資餘額" : "融券餘額")}
              wrapperStyle={{ fontSize: 12, color: "#9ca3af" }}
            />
            <Line
              yAxisId="margin"
              type="monotone"
              dataKey="marginBalance"
              stroke="#38bdf8"
              dot={false}
              strokeWidth={1.5}
            />
            <Line
              yAxisId="short"
              type="monotone"
              dataKey="shortBalance"
              stroke="#fbbf24"
              dot={false}
              strokeWidth={1.5}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
