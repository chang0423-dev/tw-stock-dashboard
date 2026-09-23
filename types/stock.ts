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

export interface InstitutionalFlowPoint {
  date: string;
  /** Net buy (張); Foreign_Investor + Foreign_Dealer_Self. */
  foreign: number;
  /** Net buy (張). */
  investmentTrust: number;
  /** Net buy (張); Dealer_self + Dealer_Hedging (+ legacy Dealer). */
  dealer: number;
  /** Sum of the three. */
  total: number;
}

export interface MarginTradingPoint {
  date: string;
  /** 融資餘額（張） */
  marginBalance: number;
  /** vs previous trading day（張） */
  marginChange: number;
  /** 融券餘額（張） */
  shortBalance: number;
  /** vs previous trading day（張） */
  shortChange: number;
}

export interface ApiErrorBody {
  error: string;
  code: "NOT_FOUND" | "UPSTREAM_ERROR" | "RATE_LIMITED" | "BAD_REQUEST";
}
