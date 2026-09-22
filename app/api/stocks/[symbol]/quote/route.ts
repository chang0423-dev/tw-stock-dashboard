import { NextResponse } from "next/server";
import { getStockSummary } from "@/lib/providers/finmind";
import { getQuote } from "@/lib/providers/twseRealtime";
import { errorResponse } from "@/lib/apiError";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  let summary;
  try {
    summary = await getStockSummary(symbol);
  } catch {
    return errorResponse("UPSTREAM_ERROR", "股票清單服務暫時無法使用，請稍後再試");
  }

  if (!summary) {
    return errorResponse("NOT_FOUND", `查無股票代號「${symbol}」`);
  }

  try {
    const quote = await getQuote(symbol, summary.market);
    return NextResponse.json(quote);
  } catch {
    return errorResponse("UPSTREAM_ERROR", "無法取得即時股價，請稍後再試");
  }
}
