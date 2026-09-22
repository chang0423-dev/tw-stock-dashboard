"use client";

import { useEffect, useRef, useState } from "react";
import { searchStocks, StockServiceError } from "@/lib/stockService";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { StockSummary } from "@/types/stock";

interface SearchBoxProps {
  onSelect: (stock: StockSummary) => void;
}

export function SearchBox({ onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSummary[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = debouncedQuery.trim();

  const [loadedFor, setLoadedFor] = useState(trimmedQuery);
  if (loadedFor !== trimmedQuery) {
    setLoadedFor(trimmedQuery);
    if (!trimmedQuery) {
      setResults([]);
      setError(null);
    }
  }

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchStocks(trimmed)
      .then((data) => {
        if (cancelled) return;
        setResults(data);
        setError(data.length === 0 ? `查無符合「${trimmed}」的股票` : null);
      })
      .catch((err) => {
        if (cancelled) return;
        setResults([]);
        setError(err instanceof StockServiceError ? err.message : "搜尋服務暫時無法使用");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(stock: StockSummary) {
    onSelect(stock);
    setQuery(`${stock.symbol} ${stock.name}`);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="輸入股票代號或名稱，例如 2330 或 台積電"
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-100 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-950"
      />
      {open && (query.trim() || loading) && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-lg">
          {loading && <div className="px-4 py-3 text-sm text-gray-400">搜尋中…</div>}
          {!loading && error && <div className="px-4 py-3 text-sm text-gray-400">{error}</div>}
          {!loading &&
            results.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelect(stock)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-800"
              >
                <span className="font-medium text-gray-100">
                  {stock.symbol} {stock.name}
                </span>
                <span className="text-xs text-gray-500">
                  {stock.market === "TSE" ? "上市" : "上櫃"}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
