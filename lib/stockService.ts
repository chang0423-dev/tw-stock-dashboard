import type {
  ApiErrorBody,
  HistoryPoint,
  HistoryRange,
  StockInfo,
  StockQuote,
  StockSummary,
} from "@/types/stock";

export class StockServiceError extends Error {
  code: ApiErrorBody["code"];

  constructor(body: ApiErrorBody) {
    super(body.error);
    this.code = body.code;
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new StockServiceError(
      body ?? { error: "發生未預期的錯誤", code: "UPSTREAM_ERROR" }
    );
  }
  return (await res.json()) as T;
}

export function searchStocks(query: string): Promise<StockSummary[]> {
  return getJson(`/api/stocks/search?q=${encodeURIComponent(query)}`);
}

export function fetchQuote(symbol: string): Promise<StockQuote> {
  return getJson(`/api/stocks/${encodeURIComponent(symbol)}/quote`);
}

export function fetchInfo(symbol: string): Promise<StockInfo> {
  return getJson(`/api/stocks/${encodeURIComponent(symbol)}/info`);
}

export function fetchHistory(
  symbol: string,
  range: HistoryRange
): Promise<HistoryPoint[]> {
  return getJson(
    `/api/stocks/${encodeURIComponent(symbol)}/history?range=${range}`
  );
}
