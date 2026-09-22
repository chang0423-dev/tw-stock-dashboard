"use client";

import { useState } from "react";
import { QuoteCard } from "@/components/QuoteCard";
import { PriceChart } from "@/components/PriceChart";
import { RangeSelector } from "@/components/RangeSelector";
import { useStockQuote } from "@/hooks/useStockQuote";
import { useStockHistory } from "@/hooks/useStockHistory";
import { useStockInfo } from "@/hooks/useStockInfo";
import type { HistoryRange } from "@/types/stock";

interface StockDashboardProps {
  symbol: string;
}

export function StockDashboard({ symbol }: StockDashboardProps) {
  const [range, setRange] = useState<HistoryRange>("1m");
  const { quote, loading: quoteLoading, error: quoteError, refetch: refetchQuote } =
    useStockQuote(symbol);
  const { info } = useStockInfo(symbol);
  const {
    data: history,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useStockHistory(symbol, range);

  return (
    <div className="flex flex-col gap-6">
      <QuoteCard
        quote={quote}
        info={info}
        loading={quoteLoading}
        error={quoteError}
        onRetry={refetchQuote}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">歷史股價走勢</h3>
          <RangeSelector value={range} onChange={setRange} />
        </div>
        <PriceChart
          data={history}
          loading={historyLoading}
          error={historyError}
          onRetry={refetchHistory}
        />
      </div>
    </div>
  );
}
