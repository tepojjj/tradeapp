"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TradeForm({ symbol, price }: { symbol: string; price: number }) {
  const [shares, setShares] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function submit(type: "buy" | "sell") {
    setBusy(true);
    setStatus(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.rpc("execute_trade", {
      p_symbol: symbol,
      p_type: type,
      p_shares: shares,
      p_price: price,
    });

    setBusy(false);

    if (error) {
      setStatus(error.message);
    } else {
      setStatus(`${type === "buy" ? "Bought" : "Sold"} ${shares} share${shares === 1 ? "" : "s"} of ${symbol}.`);
      router.refresh();
    }
  }

  return (
    <div className="bg-board-raised border border-board-line rounded-sm p-4">
      <p className="font-mono text-xs text-dim uppercase tracking-widest mb-3">Paper trade</p>

      <label className="block text-xs text-dim mb-1">Shares</label>
      <input
        type="number"
        min={1}
        step={1}
        value={shares}
        onChange={(e) => setShares(Math.max(1, Number(e.target.value)))}
        className="w-full bg-board border border-board-line rounded-sm px-3 py-2 text-ivory font-mono mb-3 focus:outline-none focus:ring-1 focus:ring-amber"
      />

      <p className="text-xs text-dim mb-4">
        Est. total:{" "}
        <span className="font-mono text-ivory">${(shares * price).toFixed(2)}</span>
      </p>

      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => submit("buy")}
          className="flex-1 bg-gain text-board font-medium py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Buy
        </button>
        <button
          disabled={busy}
          onClick={() => submit("sell")}
          className="flex-1 bg-loss text-board font-medium py-2 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Sell
        </button>
      </div>

      {status && <p className="text-xs text-dim mt-3">{status}</p>}
    </div>
  );
}
