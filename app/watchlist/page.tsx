import { createClient } from "@/lib/supabase/server";
import { getQuotes } from "@/lib/stockApi";
import StockCard from "@/components/StockCard";
import Link from "next/link";

export default async function WatchlistPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-2xl text-ivory mb-2">Sign in to build a watchlist</p>
        <Link href="/login" className="text-amber underline text-sm">
          Go to sign in
        </Link>
      </div>
    );
  }

  const { data: items } = await supabase
    .from("watchlist")
    .select("symbol")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  const symbols = (items ?? []).map((i: { symbol: string }) => i.symbol);

  // One batched request for the whole watchlist instead of one per symbol.
  const quotes = await getQuotes(symbols).catch(() => []);

  return (
    <div>
      <h1 className="font-display text-3xl text-ivory mb-6">Your watchlist</h1>

      {quotes.length === 0 ? (
        <p className="text-dim text-sm">
          Nothing here yet — search for a ticker and tap &ldquo;Add to watchlist.&rdquo;
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quotes.map((q) => (
            <StockCard key={q.symbol} quote={q} />
          ))}
        </div>
      )}
    </div>
  );
}
