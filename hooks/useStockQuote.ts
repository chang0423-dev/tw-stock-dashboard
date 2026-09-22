"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchQuote, StockServiceError } from "@/lib/stockService";
import type { StockQuote } from "@/types/stock";

const POLL_INTERVAL_MS = 15_000;

interface UseStockQuoteResult {
  quote: StockQuote | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStockQuote(symbol: string | null): UseStockQuoteResult {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Reset state during render when the symbol changes, instead of in an
  // effect, so a symbol switch never shows a stale quote from the old one.
  const [loadedFor, setLoadedFor] = useState(symbol);
  if (loadedFor !== symbol) {
    setLoadedFor(symbol);
    setQuote(null);
    setError(null);
  }

  const load = useCallback(async () => {
    if (!symbol) return;
    const id = ++requestId.current;
    setLoading(true);
    try {
      const data = await fetchQuote(symbol);
      if (id !== requestId.current) return;
      setQuote(data);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof StockServiceError ? err.message : "無法取得即時股價");
      setQuote(null);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [symbol, load]);

  return { quote, loading, error, refetch: load };
}
