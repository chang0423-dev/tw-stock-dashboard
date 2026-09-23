"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { InstitutionalFlowPoint } from "@/types/stock";

interface InstitutionalFlowChartProps {
  data: InstitutionalFlowPoint[];
}

const NAME_MAP: Record<string, string> = {
  foreign: "外資",
  investmentTrust: "投信",
  dealer: "自營商",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatLots(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toLocaleString("zh-TW", { maximumFractionDigits: 0 })}`;
}

export function InstitutionalFlowChart({ data }: InstitutionalFlowChartProps) {
  const last5Total = useMemo(() => {
    return data.slice(-5).reduce((sum, p) => sum + p.total, 0);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-sm text-gray-500">
        查無此區間的法人買賣超資料
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">三大法人買賣超（張）</h3>
        <span className="text-xs text-gray-400">
          近 5 日合計{" "}
          <span className={last5Total >= 0 ? "text-red-400" : "text-green-400"}>
            {formatLots(last5Total)} 張
          </span>
        </span>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
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
              formatter={(value, name) => [formatLots(Number(value)), NAME_MAP[String(name)] ?? name]}
            />
            <Legend
              formatter={(value) => NAME_MAP[value] ?? value}
              wrapperStyle={{ fontSize: 12, color: "#9ca3af" }}
            />
            <Bar dataKey="foreign" stackId="a" fill="#38bdf8" isAnimationActive={false} />
            <Bar dataKey="investmentTrust" stackId="a" fill="#fbbf24" isAnimationActive={false} />
            <Bar dataKey="dealer" stackId="a" fill="#c084fc" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
