import { NextRequest, NextResponse } from "next/server";
import { getInstitutionalFlow, getStockSummary } from "@/lib/providers/finmind";
import { errorResponse } from "@/lib/apiError";
import type { HistoryRange } from "@/types/stock";

const VALID_RANGES: HistoryRange[] = ["1m", "3m", "1y"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const rangeParam = request.nextUrl.searchParams.get("range") ?? "1y";

  if (!VALID_RANGES.includes(rangeParam as HistoryRange)) {
    return errorResponse("BAD_REQUEST", `無效的區間參數，請使用 ${VALID_RANGES.join(", ")}`);
  }
  const range = rangeParam as HistoryRange;

  try {
    const summary = await getStockSummary(symbol);
    if (!summary) {
      return errorResponse("NOT_FOUND", `查無股票代號「${symbol}」`);
    }
  } catch {
    return errorResponse("UPSTREAM_ERROR", "股票清單服務暫時無法使用，請稍後再試");
  }

  try {
    const flow = await getInstitutionalFlow(symbol, range);
    return NextResponse.json(flow);
  } catch {
    return errorResponse("UPSTREAM_ERROR", "無法取得法人買賣超資料，請稍後再試");
  }
}
