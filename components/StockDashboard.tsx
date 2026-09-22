"use client";

import { useMemo, useState } from "react";
import { QuoteCard } from "@/components/QuoteCard";
import { CandlestickChart } from "@/components/CandlestickChart";
import { KDChart } from "@/components/KDChart";
import { MACDChart } from "@/components/MACDChart";
import { RangeSelector } from "@/components/RangeSelector";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useStockQuote } from "@/hooks/useStockQuote";
import { useStockHistory } from "@/hooks/useStockHistory";
import { useStockInfo } from "@/hooks/useStockInfo";
import { computeTechnicalSeries, sliceByRange } from "@/lib/indicators";
import type { HistoryRange } from "@/types/stock";

interface StockDashboardProps {
  symbol: string;
}

export function StockDashboard({ symbol }: StockDashboardProps) {
  const [range, setRange] = useState<HistoryRange>("3m");
  const { quote, loading: quoteLoading, error: quoteError, refetch: refetchQuote } =
    useStockQuote(symbol);
  const { info } = useStockInfo(symbol);
  const {
    data: history,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useStockHistory(symbol);

  const visibleSeries = useMemo(() => {
    const full = computeTechnicalSeries(history);
    return sliceByRange(full, range);
  }, [history, range]);

  return (
    <div className="flex flex-col gap-4">
      <QuoteCard
        quote={quote}
        info={info}
        loading={quoteLoading}
        error={quoteError}
        onRetry={refetchQuote}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">技術分析（僅供參考，非投資建議）</h3>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {historyLoading && history.length === 0 && (
        <div className="flex h-80 animate-pulse items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-sm text-gray-500">
          載入技術指標中…
        </div>
      )}

      {historyError && <ErrorBanner message={historyError} onRetry={refetchHistory} />}

      {!historyError && history.length > 0 && (
        <>
          <CandlestickChart data={visibleSeries} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KDChart data={visibleSeries} />
            <MACDChart data={visibleSeries} />
          </div>
        </>
      )}
    </div>
  );
}
