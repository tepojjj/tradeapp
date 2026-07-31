"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function WatchlistButton({ symbol }: { symbol: string }) {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("watchlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("symbol", symbol)
        .maybeSingle();

      setInWatchlist(!!data);
      setLoading(false);
    }
    init();
  }, [symbol]);

  async function toggle() {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    if (inWatchlist) {
      await supabase.from("watchlist").delete().eq("user_id", userId).eq("symbol", symbol);
      setInWatchlist(false);
    } else {
      await supabase.from("watchlist").insert({ user_id: userId, symbol });
      setInWatchlist(true);
    }
  }

  if (loading) return null;

  return (
    <button
      onClick={toggle}
      className={`text-sm px-3 py-1.5 rounded-sm border transition-colors ${
        inWatchlist
          ? "border-amber text-amber"
          : "border-board-line text-dim hover:text-ivory hover:border-ivory"
      }`}
    >
      {inWatchlist ? "★ On watchlist" : "☆ Add to watchlist"}
    </button>
  );
}
