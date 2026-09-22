"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TechnicalPoint } from "@/lib/indicators";

interface MACDChartProps {
  data: TechnicalPoint[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function MACDChart({ data }: MACDChartProps) {
  const latest = data[data.length - 1];

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">MACD（12,26,9）</h3>
        {latest && latest.dif !== null && latest.macdSignal !== null && latest.osc !== null && (
          <span className="text-xs text-gray-400">
            DIF <span className="text-sky-400">{latest.dif.toFixed(2)}</span>　訊號{" "}
            <span className="text-amber-400">{latest.macdSignal.toFixed(2)}</span>　OSC{" "}
            <span className={latest.osc >= 0 ? "text-red-400" : "text-green-400"}>
              {latest.osc.toFixed(2)}
            </span>
          </span>
        )}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              minTickGap={30}
            />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
            <ReferenceLine y={0} stroke="#4b5563" />
            <Tooltip
              contentStyle={{ background: "#111827", border: "1px solid #374151", fontSize: 12 }}
              labelFormatter={(label) => new Date(String(label)).toLocaleDateString("zh-TW")}
              formatter={(value, name) => {
                const label = name === "dif" ? "DIF" : name === "macdSignal" ? "訊號" : "OSC";
                return [Number(value).toFixed(2), label];
              }}
            />
            <Bar dataKey="osc" isAnimationActive={false}>
              {data.map((p) => (
                <Cell
                  key={p.date}
                  fill={(p.osc ?? 0) >= 0 ? "#f87171" : "#4ade80"}
                  opacity={0.7}
                />
              ))}
            </Bar>
            <Line type="monotone" dataKey="dif" stroke="#38bdf8" dot={false} strokeWidth={1.5} connectNulls />
            <Line
              type="monotone"
              dataKey="macdSignal"
              stroke="#fbbf24"
              dot={false}
              strokeWidth={1.5}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
