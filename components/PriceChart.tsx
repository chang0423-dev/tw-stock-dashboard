"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorBanner } from "@/components/ErrorBanner";
import type { HistoryPoint } from "@/types/stock";

interface PriceChartProps {
  data: HistoryPoint[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function PriceChart({ data, loading, error, onRetry }: PriceChartProps) {
  if (error) {
    return <ErrorBanner message={error} onRetry={onRetry} />;
  }

  if (loading) {
    return (
      <div className="flex h-72 animate-pulse items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
        載入走勢圖中…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
        此區間查無歷史股價資料
      </div>
    );
  }

  const closes = data.map((d) => d.close);
  const domainMin = Math.min(...closes);
  const domainMax = Math.max(...closes);
  const padding = (domainMax - domainMin) * 0.1 || domainMax * 0.02;

  return (
    <div className="h-72 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            minTickGap={30}
          />
          <YAxis
            domain={[domainMin - padding, domainMax + padding]}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            width={50}
          />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(2), "收盤價"]}
            labelFormatter={(label) => new Date(String(label)).toLocaleDateString("zh-TW")}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#priceFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
