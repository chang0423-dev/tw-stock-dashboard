"use client";

import { useMemo, useState } from "react";
import { QuoteCard } from "@/components/QuoteCard";
import { CandlestickChart } from "@/components/CandlestickChart";
import { KDChart } from "@/components/KDChart";
import { MACDChart } from "@/components/MACDChart";
import { RSIChart } from "@/components/RSIChart";
import { MarketBreadthStat } from "@/components/MarketBreadthStat";
import { InstitutionalFlowChart } from "@/components/InstitutionalFlowChart";
import { MarginTradingChart } from "@/components/MarginTradingChart";
import { RangeSelector } from "@/components/RangeSelector";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useStockQuote } from "@/hooks/useStockQuote";
import { useStockHistory } from "@/hooks/useStockHistory";
import { useStockInfo } from "@/hooks/useStockInfo";
import { useInstitutionalFlow } from "@/hooks/useInstitutionalFlow";
import { useMarginTrading } from "@/hooks/useMarginTrading";
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
  const {
    data: institutionalFlow,
    loading: institutionalLoading,
    error: institutionalError,
    refetch: refetchInstitutional,
  } = useInstitutionalFlow(symbol);
  const {
    data: marginTrading,
    loading: marginLoading,
    error: marginError,
    refetch: refetchMargin,
  } = useMarginTrading(symbol);

  const visibleSeries = useMemo(() => {
    const full = computeTechnicalSeries(history);
    return sliceByRange(full, range);
  }, [history, range]);

  const volumeRatio = useMemo(() => {
    if (!quote || quote.volume === null || history.length === 0) return null;
    const recent = history.slice(-20);
    const avg = recent.reduce((sum, p) => sum + p.volume, 0) / recent.length;
    return avg > 0 ? quote.volume / avg : null;
  }, [quote, history]);

  const visibleInstitutionalFlow = useMemo(
    () => sliceByRange(institutionalFlow, range),
    [institutionalFlow, range]
  );
  const visibleMarginTrading = useMemo(
    () => sliceByRange(marginTrading, range),
    [marginTrading, range]
  );

  return (
    <div className="flex flex-col gap-4">
      <QuoteCard
        quote={quote}
        info={info}
        loading={quoteLoading}
        error={quoteError}
        onRetry={refetchQuote}
        volumeRatio={volumeRatio}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KDChart data={visibleSeries} />
            <MACDChart data={visibleSeries} />
            <RSIChart data={visibleSeries} />
          </div>
          <MarketBreadthStat data={visibleSeries} />
        </>
      )}

      <h3 className="mt-2 text-sm font-medium text-gray-400">籌碼面（僅供參考，非投資建議）</h3>

      {institutionalLoading && institutionalFlow.length === 0 && (
        <div className="flex h-56 animate-pulse items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-sm text-gray-500">
          載入法人買賣超中…
        </div>
      )}
      {institutionalError && (
        <ErrorBanner message={institutionalError} onRetry={refetchInstitutional} />
      )}
      {!institutionalError && institutionalFlow.length > 0 && (
        <InstitutionalFlowChart data={visibleInstitutionalFlow} />
      )}

      {marginLoading && marginTrading.length === 0 && (
        <div className="flex h-56 animate-pulse items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-sm text-gray-500">
          載入融資融券中…
        </div>
      )}
      {marginError && <ErrorBanner message={marginError} onRetry={refetchMargin} />}
      {!marginError && marginTrading.length > 0 && (
        <MarginTradingChart data={visibleMarginTrading} />
      )}
    </div>
  );
}
