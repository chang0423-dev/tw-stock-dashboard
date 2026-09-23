"use client";

import { useMemo, useRef, useState } from "react";
import type { TechnicalPoint } from "@/lib/indicators";

interface CandlestickChartProps {
  data: TechnicalPoint[];
}

const VIEW_W = 800;
const VIEW_H = 340;
const PAD_LEFT = 52;
const PAD_RIGHT = 12;
const PRICE_TOP = 12;
const PRICE_BOTTOM = 220;
const VOL_TOP = 240;
const VOL_BOTTOM = 300;
const AXIS_LABEL_Y = 320;

const UP_COLOR = "#f87171";
const DOWN_COLOR = "#4ade80";
const MA5_COLOR = "#fbbf24";
const MA10_COLOR = "#38bdf8";
const MA20_COLOR = "#c084fc";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function buildLinePath(
  values: (number | null)[],
  xAt: (i: number) => number,
  yAt: (v: number) => number
): string {
  let path = "";
  let drawing = false;
  values.forEach((v, i) => {
    if (v === null) {
      drawing = false;
      return;
    }
    const cmd = drawing ? "L" : "M";
    path += `${cmd}${xAt(i).toFixed(2)},${yAt(v).toFixed(2)} `;
    drawing = true;
  });
  return path.trim();
}

export function CandlestickChart({ data }: CandlestickChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const n = data.length;
  const plotWidth = VIEW_W - PAD_LEFT - PAD_RIGHT;
  const step = n > 0 ? plotWidth / n : 0;
  const candleWidth = Math.max(1, Math.min(8, step * 0.6));

  const xAt = (i: number) => PAD_LEFT + step * i + step / 2;

  const { priceMin, priceMax, volMax } = useMemo(() => {
    if (n === 0) return { priceMin: 0, priceMax: 1, volMax: 1 };
    let lo = Infinity;
    let hi = -Infinity;
    let vMax = 0;
    for (const p of data) {
      lo = Math.min(lo, p.low);
      hi = Math.max(hi, p.high);
      vMax = Math.max(vMax, p.volume);
    }
    const padding = (hi - lo) * 0.08 || hi * 0.02 || 1;
    return { priceMin: lo - padding, priceMax: hi + padding, volMax: vMax || 1 };
  }, [data, n]);

  const yPriceAt = (v: number) =>
    PRICE_BOTTOM - ((v - priceMin) / (priceMax - priceMin || 1)) * (PRICE_BOTTOM - PRICE_TOP);
  const yVolAt = (v: number) => VOL_BOTTOM - (v / volMax) * (VOL_BOTTOM - VOL_TOP);

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const ratio = VIEW_W / rect.width;
    const localX = (e.clientX - rect.left) * ratio;
    const idx = Math.round((localX - PAD_LEFT - step / 2) / step);
    setHoverIndex(Math.min(n - 1, Math.max(0, idx)));
  }

  const activeIndex = hoverIndex ?? n - 1;
  const active = n > 0 ? data[activeIndex] : null;

  const ma5Path = useMemo(
    () => buildLinePath(data.map((p) => p.ma5), xAt, yPriceAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- xAt/yPriceAt are pure re-derivations of step/priceMin/priceMax, which change only when data does
    [data, step, priceMin, priceMax]
  );
  const ma10Path = useMemo(
    () => buildLinePath(data.map((p) => p.ma10), xAt, yPriceAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, step, priceMin, priceMax]
  );
  const ma20Path = useMemo(
    () => buildLinePath(data.map((p) => p.ma20), xAt, yPriceAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, step, priceMin, priceMax]
  );

  const priceTicks = [priceMax, (priceMax + priceMin) / 2, priceMin];
  const xTickEvery = Math.max(1, Math.round(n / 6));

  if (n === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-sm text-gray-500">
        查無此區間的股價資料
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-300">K 線圖・均線・成交量</h3>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MA5_COLOR }} />
            MA5
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MA10_COLOR }} />
            MA10
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MA20_COLOR }} />
            MA20
          </span>
        </div>
      </div>

      {active && (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
          <span className="text-gray-300">{new Date(active.date).toLocaleDateString("zh-TW")}</span>
          <span>
            開 <span className="text-gray-200">{active.open.toFixed(2)}</span>
          </span>
          <span>
            高 <span className="text-gray-200">{active.high.toFixed(2)}</span>
          </span>
          <span>
            低 <span className="text-gray-200">{active.low.toFixed(2)}</span>
          </span>
          <span>
            收{" "}
            <span className={active.close >= active.open ? "text-red-400" : "text-green-400"}>
              {active.close.toFixed(2)}
            </span>
          </span>
          <span>
            量（張）{" "}
            <span className="text-gray-200">
              {active.volume.toLocaleString("zh-TW", { maximumFractionDigits: 0 })}
            </span>
          </span>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="block w-full"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      >
        {priceTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD_LEFT}
              x2={VIEW_W - PAD_RIGHT}
              y1={yPriceAt(t)}
              y2={yPriceAt(t)}
              stroke="#1f2937"
              strokeDasharray="3 3"
            />
            <text x={PAD_LEFT - 6} y={yPriceAt(t) + 3} textAnchor="end" fontSize="10" fill="#6b7280">
              {t.toFixed(1)}
            </text>
          </g>
        ))}

        {data.map((p, i) => {
          const up = p.close >= p.open;
          const color = up ? UP_COLOR : DOWN_COLOR;
          const bodyTop = yPriceAt(Math.max(p.open, p.close));
          const bodyBottom = yPriceAt(Math.min(p.open, p.close));
          const cx = xAt(i);
          return (
            <g key={p.date}>
              <line x1={cx} x2={cx} y1={yPriceAt(p.high)} y2={yPriceAt(p.low)} stroke={color} strokeWidth={1} />
              <rect
                x={cx - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={Math.max(1, bodyBottom - bodyTop)}
                fill={color}
              />
            </g>
          );
        })}

        <path d={ma5Path} fill="none" stroke={MA5_COLOR} strokeWidth={1.2} />
        <path d={ma10Path} fill="none" stroke={MA10_COLOR} strokeWidth={1.2} />
        <path d={ma20Path} fill="none" stroke={MA20_COLOR} strokeWidth={1.2} />

        {data.map((p, i) => {
          const up = p.close >= p.open;
          const color = up ? UP_COLOR : DOWN_COLOR;
          const cx = xAt(i);
          const h = VOL_BOTTOM - yVolAt(p.volume);
          return (
            <rect
              key={p.date}
              x={cx - candleWidth / 2}
              y={yVolAt(p.volume)}
              width={candleWidth}
              height={Math.max(1, h)}
              fill={color}
              opacity={0.7}
            />
          );
        })}

        {data.map((p, i) =>
          i % xTickEvery === 0 ? (
            <text key={p.date} x={xAt(i)} y={AXIS_LABEL_Y} textAnchor="middle" fontSize="10" fill="#6b7280">
              {formatDate(p.date)}
            </text>
          ) : null
        )}

        {hoverIndex !== null && (
          <line
            x1={xAt(hoverIndex)}
            x2={xAt(hoverIndex)}
            y1={PRICE_TOP}
            y2={VOL_BOTTOM}
            stroke="#4b5563"
            strokeDasharray="2 2"
          />
        )}

        <rect
          x={PAD_LEFT}
          y={PRICE_TOP}
          width={plotWidth}
          height={VOL_BOTTOM - PRICE_TOP}
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        />
      </svg>
    </div>
  );
}
