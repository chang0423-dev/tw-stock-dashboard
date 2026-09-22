import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/providers/finmind";
import { errorResponse } from "@/lib/apiError";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) {
    return NextResponse.json([]);
  }
  try {
    const results = await searchStocks(q);
    return NextResponse.json(results);
  } catch {
    return errorResponse("UPSTREAM_ERROR", "股票清單服務暫時無法使用，請稍後再試");
  }
}
