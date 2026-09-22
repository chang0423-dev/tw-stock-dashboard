import { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/types/stock";

const STATUS_BY_CODE: Record<ApiErrorBody["code"], number> = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
};

export function errorResponse(code: ApiErrorBody["code"], message: string) {
  const body: ApiErrorBody = { error: message, code };
  return NextResponse.json(body, { status: STATUS_BY_CODE[code] });
}
