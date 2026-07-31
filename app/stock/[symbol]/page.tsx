import { getHistory, getQuote } from "@/lib/stockApi";
import { withSMA, getTrend } from "@/lib/analysis";
import PriceChart from "@/components/PriceChart";
import TrendBadge from "@/components/TrendBadge";
import WatchlistButton from "@/components/WatchlistButton";
import TradeForm from "@/components/TradeForm";

const SMA_PERIOD = 20;

export default async function StockPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase();

  const [quote, rawHistory] = await Promise.all([
    getQuote(symbol),
    getHistory(symbol).catch(() => []),
  ]);

  const history = withSMA(rawHistory, SMA_PERIOD);
  const trend = getTrend(history);

  const positive = quote.change >= 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-sm text-dim">{quote.symbol}</p>
          <h1 className="font-display text-3xl text-ivory">{quote.name}</h1>
          <div className="flex items-baseline gap-3 mt-2 flex-wrap">
            <span className="font-mono text-3xl text-ivory">${quote.price.toFixed(2)}</span>
            <span className={`font-mono text-sm ${positive ? "text-gain" : "text-loss"}`}>
              {positive ? "▲" : "▼"} {quote.change.toFixed(2)} ({Math.abs(quote.percentChange).toFixed(2)}%)
            </span>
            <TrendBadge trend={trend} period={SMA_PERIOD} />
          </div>
        </div>
        <WatchlistButton symbol={symbol} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {history.length > 0 ? (
            <PriceChart data={history} smaPeriod={SMA_PERIOD} />
          ) : (
            <div className="h-72 flex items-center justify-center bg-board-raised border border-board-line rounded-sm text-dim text-sm">
              Historical data unavailable for {symbol}.
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Open" value={quote.open} />
            <Stat label="High" value={quote.high} />
            <Stat label="Low" value={quote.low} />
            <Stat label="Prev close" value={quote.previousClose} />
          </div>
        </div>

        <TradeForm symbol={symbol} price={quote.price} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-board-raised border border-board-line rounded-sm p-3">
      <p className="text-xs text-dim">{label}</p>
      <p className="font-mono text-ivory">${value.toFixed(2)}</p>
    </div>
  );
}
