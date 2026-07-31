import { createClient } from "@/lib/supabase/server";
import { getQuote } from "@/lib/stockApi";
import Link from "next/link";

export default async function PortfolioPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-2xl text-ivory mb-2">Sign in to see your portfolio</p>
        <Link href="/login" className="text-amber underline text-sm">
          Go to sign in
        </Link>
      </div>
    );
  }

  const [{ data: profile }, { data: holdings }, { data: transactions }] = await Promise.all([
    supabase.from("profiles").select("cash_balance").eq("id", user.id).single(),
    supabase.from("holdings").select("symbol, shares, avg_cost").eq("user_id", user.id).gt("shares", 0),
    supabase
      .from("transactions")
      .select("symbol, type, shares, price, executed_at")
      .eq("user_id", user.id)
      .order("executed_at", { ascending: false })
      .limit(10),
  ]);

  const rows = await Promise.all(
    (holdings ?? []).map(async (h: { symbol: string; shares: number; avg_cost: number }) => {
      const quote = await getQuote(h.symbol).catch(() => null);
      const marketValue = quote ? quote.price * h.shares : null;
      const costBasis = h.avg_cost * h.shares;
      const pnl = marketValue !== null ? marketValue - costBasis : null;
      return { ...h, price: quote?.price ?? null, marketValue, pnl };
    })
  );

  const holdingsValue = rows.reduce((sum, r) => sum + (r.marketValue ?? 0), 0);
  const cash = profile?.cash_balance ?? 0;
  const totalValue = cash + holdingsValue;

  return (
    <div>
      <h1 className="font-display text-3xl text-ivory mb-6">Your portfolio</h1>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <SummaryCard label="Cash" value={cash} />
        <SummaryCard label="Holdings value" value={holdingsValue} />
        <SummaryCard label="Total value" value={totalValue} highlight />
      </div>

      <h2 className="font-mono text-xs text-dim tracking-widest uppercase mb-3">Holdings</h2>
      {rows.length === 0 ? (
        <p className="text-dim text-sm mb-8">No open positions yet.</p>
      ) : (
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="text-left text-dim border-b border-board-line">
              <th className="py-2 font-normal">Symbol</th>
              <th className="py-2 font-normal">Shares</th>
              <th className="py-2 font-normal">Avg cost</th>
              <th className="py-2 font-normal">Price</th>
              <th className="py-2 font-normal">Market value</th>
              <th className="py-2 font-normal">P&amp;L</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r) => (
              <tr key={r.symbol} className="border-b border-board-line">
                <td className="py-2">
                  <Link href={`/stock/${r.symbol}`} className="text-amber">
                    {r.symbol}
                  </Link>
                </td>
                <td className="py-2">{r.shares}</td>
                <td className="py-2">${r.avg_cost.toFixed(2)}</td>
                <td className="py-2">{r.price ? `$${r.price.toFixed(2)}` : "—"}</td>
                <td className="py-2">{r.marketValue ? `$${r.marketValue.toFixed(2)}` : "—"}</td>
                <td className={`py-2 ${r.pnl && r.pnl >= 0 ? "text-gain" : "text-loss"}`}>
                  {r.pnl !== null ? `${r.pnl >= 0 ? "+" : ""}$${r.pnl.toFixed(2)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="font-mono text-xs text-dim tracking-widest uppercase mb-3">Recent activity</h2>
      {!transactions || transactions.length === 0 ? (
        <p className="text-dim text-sm">No trades yet.</p>
      ) : (
        <ul className="text-sm font-mono divide-y divide-board-line">
          {transactions.map(
            (
              t: { symbol: string; type: string; shares: number; price: number; executed_at: string },
              i: number
            ) => (
            <li key={i} className="py-2 flex justify-between">
              <span>
                <span className={t.type === "buy" ? "text-gain" : "text-loss"}>
                  {t.type.toUpperCase()}
                </span>{" "}
                {t.shares} {t.symbol} @ ${t.price.toFixed(2)}
              </span>
              <span className="text-dim">{new Date(t.executed_at).toLocaleDateString()}</span>
            </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`bg-board-raised border rounded-sm p-4 ${highlight ? "border-amber" : "border-board-line"}`}>
      <p className="text-xs text-dim mb-1">{label}</p>
      <p className={`font-mono text-xl ${highlight ? "text-amber" : "text-ivory"}`}>
        ${value.toFixed(2)}
      </p>
    </div>
  );
}
