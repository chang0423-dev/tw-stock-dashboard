"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMarginTrading, StockServiceError } from "@/lib/stockService";
import type { MarginTradingPoint } from "@/types/stock";

/** Always fetches a full year, same pattern as useStockHistory — sliced client-side per range. */
export function useMarginTrading(symbol: string | null) {
  const [data, setData] = useState<MarginTradingPoint[]>([]);
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
      const points = await fetchMarginTrading(symbol, "1y");
      if (id !== requestId.current) return;
      setData(points);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof StockServiceError ? err.message : "無法取得融資融券資料");
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
