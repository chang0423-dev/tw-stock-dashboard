"use client";

import { useEffect, useState } from "react";
import { fetchInfo, StockServiceError } from "@/lib/stockService";
import type { StockInfo } from "@/types/stock";

interface UseStockInfoResult {
  info: StockInfo | null;
  loading: boolean;
  error: string | null;
}

export function useStockInfo(symbol: string | null): UseStockInfoResult {
  const [info, setInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadedFor, setLoadedFor] = useState(symbol);
  if (loadedFor !== symbol) {
    setLoadedFor(symbol);
    setInfo(null);
    setError(null);
  }

  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;
    setLoading(true);
    fetchInfo(symbol)
      .then((data) => {
        if (cancelled) return;
        setInfo(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof StockServiceError ? err.message : "無法取得公司基本資訊");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { info, loading, error };
}
