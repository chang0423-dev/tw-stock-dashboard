"use client";

import { useMemo } from "react";
import type { TechnicalPoint } from "@/lib/indicators";

interface MarketBreadthStatProps {
  data: TechnicalPoint[];
}

export function MarketBreadthStat({ data }: MarketBreadthStatProps) {
  const { upDays, downDays, flatDays, total } = useMemo(() => {
    let up = 0;
    let down = 0;
    let flat = 0;
    for (let i = 1; i < data.length; i++) {
      const diff = data[i].close - data[i - 1].close;
      if (diff > 0) up++;
      else if (diff < 0) down++;
      else flat++;
    }
    return { upDays: up, downDays: down, flatDays: flat, total: up + down + flat };
  }, [data]);

  if (total === 0) return null;

  const upPct = (upDays / total) * 100;
  const downPct = (downDays / total) * 100;
  const flatPct = (flatDays / total) * 100;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">多空能量條</h3>
        <span className="text-xs text-gray-400">
          <span className="text-red-400">{upDays} 漲</span> /{" "}
          <span className="text-green-400">{downDays} 跌</span> / {flatDays} 平
        </span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-800">
        <div style={{ width: `${upPct}%` }} className="bg-red-400" />
        <div style={{ width: `${flatPct}%` }} className="bg-gray-600" />
        <div style={{ width: `${downPct}%` }} className="bg-green-400" />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-gray-500">
        <span>上漲 {upPct.toFixed(0)}%</span>
        <span>下跌 {downPct.toFixed(0)}%</span>
      </div>
      <p className="mt-2 text-xs text-gray-600">區間內漲跌日數占比・非預測</p>
    </div>
  );
}
