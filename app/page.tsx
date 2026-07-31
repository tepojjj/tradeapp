import StockCard from "@/components/StockCard";
import { getQuotes } from "@/lib/stockApi";

const SNAPSHOT_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"];

export default async function HomePage() {
  // One batched request for all 8 symbols instead of 8 separate requests —
  // keeps this single page load well under the free-tier per-minute cap.
  const quotes = await getQuotes(SNAPSHOT_SYMBOLS).catch(() => []);

  return (
    <div>
      <section className="mb-10">
        <p className="font-mono text-xs text-amber tracking-widest uppercase mb-2">
          Market snapshot — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-ivory max-w-2xl">
          Track the market. Trade on paper. Learn without the risk.
        </h1>
        <p className="text-dim mt-3 max-w-xl">
          Search any ticker, build a watchlist, and practice trading with a simulated
          $100,000 cash balance — no real money, real market data.
        </p>
      </section>

      <section>
        <h2 className="font-mono text-xs text-dim tracking-widest uppercase mb-3">
          Today&apos;s movers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quotes.map((q) => (
            <StockCard key={q.symbol} quote={q} />
          ))}
        </div>
      </section>
    </div>
  );
}
