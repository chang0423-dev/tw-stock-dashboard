import type { HistoryPoint } from "@/types/stock";

export interface TechnicalPoint extends HistoryPoint {
  ma5: number | null;
  ma10: number | null;
  ma20: number | null;
  k: number | null;
  d: number | null;
  dif: number | null;
  macdSignal: number | null;
  osc: number | null;
}

function sma(values: number[], period: number): (number | null)[] {
  return values.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += values[j];
    return sum / period;
  });
}

/** Taiwan-convention KD (Stochastic Oscillator): RSV over `period` days, then K/D smoothed 2:1. */
function computeKD(points: HistoryPoint[], period: number) {
  const k: (number | null)[] = [];
  const d: (number | null)[] = [];
  let prevK = 50;
  let prevD = 50;

  for (let i = 0; i < points.length; i++) {
    if (i < period - 1) {
      k.push(null);
      d.push(null);
      continue;
    }
    let highN = -Infinity;
    let lowN = Infinity;
    for (let j = i - period + 1; j <= i; j++) {
      highN = Math.max(highN, points[j].high);
      lowN = Math.min(lowN, points[j].low);
    }
    const rsv = highN === lowN ? 50 : ((points[i].close - lowN) / (highN - lowN)) * 100;
    const kVal = (prevK * 2 + rsv) / 3;
    const dVal = (prevD * 2 + kVal) / 3;
    k.push(kVal);
    d.push(dVal);
    prevK = kVal;
    prevD = dVal;
  }
  return { k, d };
}

function computeEMA(values: (number | null)[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const mult = 2 / (period + 1);
  let emaPrev: number | null = null;
  let warmupCount = 0;

  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v === null) {
      result.push(null);
      continue;
    }
    warmupCount++;
    if (warmupCount < period) {
      result.push(null);
      continue;
    }
    if (emaPrev === null) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += values[j] as number;
      emaPrev = sum / period;
    } else {
      emaPrev = v * mult + emaPrev * (1 - mult);
    }
    result.push(emaPrev);
  }
  return result;
}

/** DIF (fast EMA - slow EMA), signal line (EMA of DIF), and the OSC histogram (DIF - signal). */
function computeMACD(closes: number[], fast: number, slow: number, signalPeriod: number) {
  const emaFast = computeEMA(closes, fast);
  const emaSlow = computeEMA(closes, slow);
  const dif = closes.map((_, i) => {
    const f = emaFast[i];
    const s = emaSlow[i];
    return f !== null && s !== null ? f - s : null;
  });
  const signal = computeEMA(dif, signalPeriod);
  const osc = dif.map((v, i) => {
    const s = signal[i];
    return v !== null && s !== null ? v - s : null;
  });
  return { dif, signal, osc };
}

export function computeTechnicalSeries(points: HistoryPoint[]): TechnicalPoint[] {
  const closes = points.map((p) => p.close);
  const ma5 = sma(closes, 5);
  const ma10 = sma(closes, 10);
  const ma20 = sma(closes, 20);
  const { k, d } = computeKD(points, 9);
  const { dif, signal, osc } = computeMACD(closes, 12, 26, 9);

  return points.map((p, i) => ({
    ...p,
    ma5: ma5[i],
    ma10: ma10[i],
    ma20: ma20[i],
    k: k[i],
    d: d[i],
    dif: dif[i],
    macdSignal: signal[i],
    osc: osc[i],
  }));
}

const RANGE_TRADING_DAYS: Record<"1m" | "3m" | "1y", number> = {
  "1m": 22,
  "3m": 66,
  "1y": 260,
};

/** Slices an already-computed technical series down to the visible window, keeping warm-up data out of view. */
export function sliceByRange<T>(series: T[], range: "1m" | "3m" | "1y"): T[] {
  const count = RANGE_TRADING_DAYS[range];
  return series.slice(-count);
}
