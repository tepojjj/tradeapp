import Link from "next/link";
import { Quote } from "@/lib/types";

export default function StockCard({ quote }: { quote: Quote }) {
  const positive = quote.change >= 0;

  return (
    <Link
      href={`/stock/${quote.symbol}`}
      className="block bg-board-raised border border-board-line rounded-sm p-4 hover:border-amber transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-lg text-ivory">{quote.symbol}</p>
          <p className="text-xs text-dim truncate max-w-[10rem]">{quote.name}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg text-ivory">${quote.price.toFixed(2)}</p>
          <p className={`font-mono text-xs ${positive ? "text-gain" : "text-loss"}`}>
            {positive ? "▲" : "▼"} {Math.abs(quote.percentChange).toFixed(2)}%
          </p>
        </div>
      </div>
    </Link>
  );
}
