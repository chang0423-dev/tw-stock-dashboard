export type Market = "TSE" | "OTC";

export interface StockSummary {
  symbol: string;
  name: string;
  market: Market;
  industry: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  market: Market;
  price: number | null;
  prevClose: number | null;
  change: number | null;
  changePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  updatedAt: string;
  isDelayed: true;
  source: "mis.twse.com.tw";
  tradeHalted: boolean;
}

export interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type HistoryRange = "1m" | "3m" | "1y";

export interface StockInfo {
  symbol: string;
  name: string;
  market: Market;
  industry: string;
}

export interface ApiErrorBody {
  error: string;
  code: "NOT_FOUND" | "UPSTREAM_ERROR" | "RATE_LIMITED" | "BAD_REQUEST";
}
