import { CandlePoint } from "./types";

export type PricePoint = CandlePoint & { sma: number | null };

/**
 * Adds a simple moving average (SMA) to each point in a price series.
 * The first `period - 1` points won't have enough history yet, so their
 * `sma` is null — the chart skips drawing the line until there's enough data.
 */
export function withSMA(data: CandlePoint[], period = 20): PricePoint[] {
  return data.map((point, i) => {
    if (i < period - 1) return { ...point, sma: null };

    const window = data.slice(i - period + 1, i + 1);
    const avg = window.reduce((sum, p) => sum + p.close, 0) / period;

    return { ...point, sma: Number(avg.toFixed(2)) };
  });
}

export type Trend = "above" | "below" | "unknown";

/** Compares the latest close to its SMA to describe short-term momentum. */
export function getTrend(data: PricePoint[]): Trend {
  const latest = data[data.length - 1];
  if (!latest || latest.sma === null) return "unknown";
  return latest.close >= latest.sma ? "above" : "below";
}
