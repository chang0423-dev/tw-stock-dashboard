import { ErrorBanner } from "@/components/ErrorBanner";
import type { StockInfo, StockQuote } from "@/types/stock";

interface QuoteCardProps {
  quote: StockQuote | null;
  info: StockInfo | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Today's volume ÷ recent average daily volume. Null when not yet computable. */
  volumeRatio: number | null;
}

function formatNumber(n: number | null, digits = 2): string {
  if (n === null) return "—";
  return n.toLocaleString("zh-TW", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatVolume(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString("zh-TW");
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("zh-TW", { hour12: false });
}

export function QuoteCard({ quote, info, loading, error, onRetry, volumeRatio }: QuoteCardProps) {
  if (error) {
    return <ErrorBanner message={error} onRetry={onRetry} />;
  }

  if (loading && !quote) {
    return (
      <div className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="h-5 w-40 rounded bg-gray-800" />
        <div className="mt-4 h-10 w-32 rounded bg-gray-800" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!quote) return null;

  const isUp = (quote.change ?? 0) > 0;
  const isDown = (quote.change ?? 0) < 0;
  const changeColor = isUp ? "text-red-400" : isDown ? "text-green-400" : "text-gray-400";
  const sign = isUp ? "+" : "";

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            {quote.symbol} {quote.name}
          </h2>
          {info && (
            <p className="text-sm text-gray-400">
              {info.industry} · {info.market === "TSE" ? "上市" : "上櫃"}
            </p>
          )}
        </div>
        <span className="rounded-full bg-amber-950 px-2.5 py-1 text-xs font-medium text-amber-300">
          報價延遲・非官方即時來源・{formatTime(quote.updatedAt)} 更新
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <span className="text-4xl font-bold text-gray-100">
          {quote.tradeHalted ? "尚無成交" : formatNumber(quote.price)}
        </span>
        {!quote.tradeHalted && (
          <span className={`text-lg font-semibold ${changeColor}`}>
            {sign}
            {formatNumber(quote.change)} ({sign}
            {formatNumber(quote.changePercent)}%)
          </span>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-gray-500">開盤</dt>
          <dd className="text-sm font-medium text-gray-200">{formatNumber(quote.open)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">最高</dt>
          <dd className="text-sm font-medium text-gray-200">{formatNumber(quote.high)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">最低</dt>
          <dd className="text-sm font-medium text-gray-200">{formatNumber(quote.low)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">昨收</dt>
          <dd className="text-sm font-medium text-gray-200">{formatNumber(quote.prevClose)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">成交量（張）</dt>
          <dd className="text-sm font-medium text-gray-200">{formatVolume(quote.volume)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">量比</dt>
          <dd className="text-sm font-medium text-gray-200">
            {volumeRatio === null ? "—" : `${volumeRatio.toFixed(2)} 倍`}
          </dd>
        </div>
      </dl>
    </div>
  );
}
