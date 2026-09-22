"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchHistory, StockServiceError } from "@/lib/stockService";
import type { HistoryPoint, HistoryRange } from "@/types/stock";

interface UseStockHistoryResult {
  data: HistoryPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStockHistory(
  symbol: string | null,
  range: HistoryRange
): UseStockHistoryResult {
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const key = `${symbol ?? ""}|${range}`;
  const [loadedFor, setLoadedFor] = useState(key);
  if (loadedFor !== key) {
    setLoadedFor(key);
    setData([]);
    setError(null);
  }

  const load = useCallback(async () => {
    if (!symbol) return;
    const id = ++requestId.current;
    setLoading(true);
    try {
      const points = await fetchHistory(symbol, range);
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
  }, [symbol, range]);

  useEffect(() => {
    if (!symbol) return;
    load();
  }, [symbol, range, load]);

  return { data, loading, error, refetch: load };
}
