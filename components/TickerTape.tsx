"use client";

import { useEffect, useState } from "react";
import { Quote } from "@/lib/types";

// Default symbols shown when a visitor has no watchlist yet.
const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];

export default function TickerTape() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadQuotes() {
      try {
        // One batched request instead of one request per symbol — free-tier
        // market data APIs cap requests per minute, not symbols per request.
        const res = await fetch(`/api/quote?symbols=${DEFAULT_SYMBOLS.join(",")}`);
        if (!res.ok) return;
        const data = (await res.json()) as Quote[];
        if (!cancelled) setQuotes(data);
      } catch {
        // Silently keep showing the last known quotes on a failed refresh.
      }
    }

    loadQuotes();
    // 5 minutes: generous enough to stay well under free-tier rate limits.
    const interval = setInterval(loadQuotes, 5 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (quotes.length === 0) return <div className="h-9 bg-board-raised border-b border-board-line" />;

  // Duplicate the list so the animation can loop seamlessly at -50%.
  const strip = [...quotes, ...quotes];

  return (
    <div className="h-9 bg-board-raised border-b border-board-line overflow-hidden whitespace-nowrap">
      <div className="animate-ticker inline-flex items-center h-9">
        {strip.map((q, i) => (
          <span key={`${q.symbol}-${i}`} className="inline-flex items-center gap-2 px-4 font-mono text-xs">
            <span className="text-ivory">{q.symbol}</span>
            <span className={q.change >= 0 ? "text-gain" : "text-loss"}>
              {q.price.toFixed(2)} {q.change >= 0 ? "▲" : "▼"} {Math.abs(q.percentChange).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
