import { NextResponse } from "next/server";
import { getStockSummary } from "@/lib/providers/finmind";
import { errorResponse } from "@/lib/apiError";
import type { StockInfo } from "@/types/stock";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  try {
    const summary = await getStockSummary(symbol);
    if (!summary) {
      return errorResponse("NOT_FOUND", `查無股票代號「${symbol}」`);
    }
    const info: StockInfo = summary;
    return NextResponse.json(info);
  } catch {
    return errorResponse("UPSTREAM_ERROR", "基本資訊服務暫時無法使用，請稍後再試");
  }
}
