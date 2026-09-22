"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchHistory, StockServiceError } from "@/lib/stockService";
import type { HistoryPoint } from "@/types/stock";

/**
 * Always fetches a full year of daily history — enough warm-up data for
 * MA20/KD9/MACD(12,26,9) to be fully computed even when the visible range is
 * later sliced down to 1m/3m on the client. One request per symbol instead
 * of one per range switch.
 */
export function useStockHistory(symbol: string | null) {
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const [loadedFor, setLoadedFor] = useState(symbol);
  if (loadedFor !== symbol) {
    setLoadedFor(symbol);
    setData([]);
    setError(null);
  }

  const load = useCallback(async () => {
    if (!symbol) return;
    const id = ++requestId.current;
    setLoading(true);
    try {
      const points = await fetchHistory(symbol, "1y");
      if (id !== requestId.current) return;
      setData(points);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof StockServiceError ? err.message : "無法取得歷史股價");
      setData([]);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;
    load();
  }, [symbol, load]);

  return { data, loading, error, refetch: load };
}
