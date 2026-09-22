import { withCache } from "@/lib/cache";
import type { Market, StockQuote } from "@/types/stock";
import { UpstreamError } from "@/lib/providers/finmind";

const MIS_BASE = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp";

interface MisRow {
  c: string; // 代號
  n: string; // 名稱
  z: string; // 最新成交價，尚無成交時為 "-"
  y: string; // 昨收
  o: string; // 開盤
  h: string; // 最高
  l: string; // 最低
  v: string; // 累積成交量(張)
  tlong?: string; // 時間戳 (ms)
}

interface MisResponse {
  msgArray: MisRow[];
}

function toNumber(raw: string | undefined): number | null {
  if (raw === undefined || raw === "" || raw === "-") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

async function fetchQuoteRaw(symbol: string, market: Market): Promise<StockQuote> {
  const prefix = market === "TSE" ? "tse" : "otc";
  const exCh = `${prefix}_${symbol}.tw`;
  const url = `${MIS_BASE}?ex_ch=${encodeURIComponent(exCh)}&json=1&delay=0&_=${Date.now()}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Referer: "https://mis.twse.com.tw/stock/index.jsp",
        "User-Agent": "Mozilla/5.0 (compatible; StockDashboard/1.0)",
      },
      cache: "no-store",
    });
  } catch {
    throw new UpstreamError("無法連線至即時報價來源");
  }

  if (!res.ok) {
    throw new UpstreamError(`即時報價來源回應狀態碼 ${res.status}`);
  }

  const json = (await res.json()) as MisResponse;
  const row = json.msgArray?.[0];
  if (!row) {
    throw new UpstreamError("找不到此股票代號的即時報價");
  }

  const price = toNumber(row.z);
  const prevClose = toNumber(row.y);
  const change = price !== null && prevClose !== null ? price - prevClose : null;
  const changePercent =
    change !== null && prevClose ? (change / prevClose) * 100 : null;

  return {
    symbol: row.c,
    name: row.n,
    market,
    price,
    prevClose,
    change,
    changePercent,
    open: toNumber(row.o),
    high: toNumber(row.h),
    low: toNumber(row.l),
    volume: toNumber(row.v),
    updatedAt: new Date().toISOString(),
    isDelayed: true,
    source: "mis.twse.com.tw",
    tradeHalted: price === null,
  };
}

/** Short TTL cache: keeps a burst of refreshes from hammering the upstream source. */
export async function getQuote(symbol: string, market: Market): Promise<StockQuote> {
  return withCache(`twse:quote:${symbol}`, 8 * 1000, () => fetchQuoteRaw(symbol, market));
}
