import { withCache } from "@/lib/cache";
import type {
  HistoryPoint,
  HistoryRange,
  InstitutionalFlowPoint,
  Market,
  MarginTradingPoint,
  StockSummary,
} from "@/types/stock";

const FINMIND_BASE = "https://api.finmindtrade.com/api/v4/data";

class UpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstreamError";
  }
}

interface FinMindStockInfoRow {
  stock_id: string;
  stock_name: string;
  industry_category: string;
  type: string;
}

interface FinMindStockPriceRow {
  date: string;
  stock_id: string;
  Trading_Volume: number;
  open: number;
  max: number;
  min: number;
  close: number;
}

interface FinMindInstitutionalRow {
  date: string;
  stock_id: string;
  buy: number;
  sell: number;
  name: string;
}

interface FinMindMarginRow {
  date: string;
  stock_id: string;
  MarginPurchaseTodayBalance: number;
  MarginPurchaseYesterdayBalance: number;
  ShortSaleTodayBalance: number;
  ShortSaleYesterdayBalance: number;
}

function buildUrl(params: Record<string, string>): string {
  const url = new URL(FINMIND_BASE);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const token = process.env.FINMIND_API_TOKEN;
  if (token) url.searchParams.set("token", token);
  return url.toString();
}

async function callFinMind<T>(params: Record<string, string>): Promise<T[]> {
  const res = await fetch(buildUrl(params), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new UpstreamError(`FinMind 回應狀態碼 ${res.status}`);
  }
  const json = (await res.json()) as { status: number; msg: string; data: T[] };
  if (json.status !== 200) {
    throw new UpstreamError(json.msg || "FinMind API 回傳錯誤");
  }
  return json.data;
}

function toMarket(type: string): Market {
  return type.startsWith("tpex") ? "OTC" : "TSE";
}

async function fetchStockList(): Promise<StockSummary[]> {
  const rows = await callFinMind<FinMindStockInfoRow>({ dataset: "TaiwanStockInfo" });
  const bySymbol = new Map<string, StockSummary>();
  for (const row of rows) {
    if (!row.stock_id || !row.stock_name) continue;
    if (bySymbol.has(row.stock_id)) continue;
    bySymbol.set(row.stock_id, {
      symbol: row.stock_id,
      name: row.stock_name,
      market: toMarket(row.type),
      industry: row.industry_category || "未分類",
    });
  }
  return Array.from(bySymbol.values());
}

/** Full TWSE/TPEx stock list, cached for 24h since it rarely changes. */
export async function getStockList(): Promise<StockSummary[]> {
  return withCache("finmind:stock-list", 24 * 60 * 60 * 1000, fetchStockList);
}

export async function searchStocks(query: string, limit = 10): Promise<StockSummary[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const list = await getStockList();
  return list
    .filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

export async function getStockSummary(symbol: string): Promise<StockSummary | undefined> {
  const list = await getStockList();
  return list.find((s) => s.symbol === symbol);
}

function rangeToStartDate(range: HistoryRange): string {
  const now = new Date();
  const start = new Date(now);
  if (range === "1m") start.setMonth(start.getMonth() - 1);
  else if (range === "3m") start.setMonth(start.getMonth() - 3);
  else start.setFullYear(start.getFullYear() - 1);
  return start.toISOString().slice(0, 10);
}

async function fetchHistory(symbol: string, range: HistoryRange): Promise<HistoryPoint[]> {
  const startDate = rangeToStartDate(range);
  const endDate = new Date().toISOString().slice(0, 10);
  const rows = await callFinMind<FinMindStockPriceRow>({
    dataset: "TaiwanStockPrice",
    data_id: symbol,
    start_date: startDate,
    end_date: endDate,
  });
  return rows
    .filter((r) => r.open != null && r.close != null)
    .map((r) => ({
      date: r.date,
      open: r.open,
      high: r.max,
      low: r.min,
      close: r.close,
      // Trading_Volume is reported in 股 (shares); convert to 張 (board lots)
      // to match the 張-denominated volume shown elsewhere (quote, margin, institutional flow).
      volume: r.Trading_Volume / 1000,
    }));
}

export async function getHistory(symbol: string, range: HistoryRange): Promise<HistoryPoint[]> {
  return withCache(`finmind:history:${symbol}:${range}`, 10 * 60 * 1000, () =>
    fetchHistory(symbol, range)
  );
}

/** Institutional buy/sell is reported in 股 (shares); convert to 張 (board lots) for display. */
function toLots(shares: number): number {
  return shares / 1000;
}

async function fetchInstitutionalFlow(
  symbol: string,
  range: HistoryRange
): Promise<InstitutionalFlowPoint[]> {
  const startDate = rangeToStartDate(range);
  const endDate = new Date().toISOString().slice(0, 10);
  const rows = await callFinMind<FinMindInstitutionalRow>({
    dataset: "TaiwanStockInstitutionalInvestorsBuySell",
    data_id: symbol,
    start_date: startDate,
    end_date: endDate,
  });

  const byDate = new Map<string, { foreign: number; investmentTrust: number; dealer: number }>();
  for (const row of rows) {
    const net = toLots(row.buy - row.sell);
    const entry = byDate.get(row.date) ?? { foreign: 0, investmentTrust: 0, dealer: 0 };
    if (row.name === "Foreign_Investor" || row.name === "Foreign_Dealer_Self") {
      entry.foreign += net;
    } else if (row.name === "Investment_Trust") {
      entry.investmentTrust += net;
    } else if (row.name === "Dealer" || row.name === "Dealer_self" || row.name === "Dealer_Hedging") {
      entry.dealer += net;
    }
    byDate.set(row.date, entry);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, v]) => ({
      date,
      foreign: v.foreign,
      investmentTrust: v.investmentTrust,
      dealer: v.dealer,
      total: v.foreign + v.investmentTrust + v.dealer,
    }));
}

export async function getInstitutionalFlow(
  symbol: string,
  range: HistoryRange
): Promise<InstitutionalFlowPoint[]> {
  return withCache(`finmind:institutional:${symbol}:${range}`, 10 * 60 * 1000, () =>
    fetchInstitutionalFlow(symbol, range)
  );
}

async function fetchMarginTrading(symbol: string, range: HistoryRange): Promise<MarginTradingPoint[]> {
  const startDate = rangeToStartDate(range);
  const endDate = new Date().toISOString().slice(0, 10);
  const rows = await callFinMind<FinMindMarginRow>({
    dataset: "TaiwanStockMarginPurchaseShortSale",
    data_id: symbol,
    start_date: startDate,
    end_date: endDate,
  });
  return rows.map((r) => ({
    date: r.date,
    marginBalance: r.MarginPurchaseTodayBalance,
    marginChange: r.MarginPurchaseTodayBalance - r.MarginPurchaseYesterdayBalance,
    shortBalance: r.ShortSaleTodayBalance,
    shortChange: r.ShortSaleTodayBalance - r.ShortSaleYesterdayBalance,
  }));
}

export async function getMarginTrading(
  symbol: string,
  range: HistoryRange
): Promise<MarginTradingPoint[]> {
  return withCache(`finmind:margin:${symbol}:${range}`, 10 * 60 * 1000, () =>
    fetchMarginTrading(symbol, range)
  );
}

export { UpstreamError };
