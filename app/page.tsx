"use client";

import { useState } from "react";
import { SearchBox } from "@/components/SearchBox";
import { StockDashboard } from "@/components/StockDashboard";
import type { StockSummary } from "@/types/stock";

export default function Home() {
  const [selected, setSelected] = useState<StockSummary | null>(null);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            台股個股資訊儀表板
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            查詢台股個股即時報價與歷史走勢（報價為近即時延遲資料，非交易所官方逐筆行情）
          </p>
        </header>

        <SearchBox onSelect={setSelected} />

        {selected ? (
          <StockDashboard key={selected.symbol} symbol={selected.symbol} />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400 dark:border-gray-700">
            搜尋並選擇一檔股票以查看即時資訊
          </div>
        )}
      </main>
    </div>
  );
}
