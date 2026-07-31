import { CandlePoint, Quote, SearchResult } from "./types";

const BASE_URL = "https://api.twelvedata.com";

function apiKey() {
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) throw new Error("TWELVE_DATA_API_KEY is not set in your .env.local");
  return key;
}

function parseQuote(data: any): Quote {
  return {
    symbol: data.symbol,
    name: data.name,
    price: Number(data.close),
    change: Number(data.change),
    percentChange: Number(data.percent_change),
    open: Number(data.open),
    high: Number(data.high),
    low: Number(data.low),
    previousClose: Number(data.previous_close),
  };
}

export async function getQuote(symbol: string): Promise<Quote> {
  const res = await fetch(
    `${BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey()}`,
    { next: { revalidate: 60 } } // cache for a minute, free tier is rate-limited to 8 req/min
  );
  const data = await res.json();

  if (data.status === "error") {
    throw new Error(data.message || `Could not fetch quote for ${symbol}`);
  }

  return parseQuote(data);
}

// Fetches multiple symbols in ONE request instead of one request per symbol.
// This is the difference between an 8-symbol watchlist costing 8 requests vs 1.
export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];

  const res = await fetch(
    `${BASE_URL}/quote?symbol=${symbols.map(encodeURIComponent).join(",")}&apikey=${apiKey()}`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();

  // Twelve Data returns a single object for 1 symbol, or an object keyed
  // by symbol for multiple — normalize both shapes into an array.
  const rawQuotes = symbols.length === 1 ? [data] : Object.values(data);

  return rawQuotes
    .filter((d: any) => d && d.status !== "error" && d.symbol)
    .map((d) => parseQuote(d));
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const res = await fetch(
    `${BASE_URL}/symbol_search?symbol=${encodeURIComponent(query)}&apikey=${apiKey()}`,
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();

  if (!data.data) return [];

  return data.data.slice(0, 8).map((item: any) => ({
    symbol: item.symbol,
    name: item.instrument_name,
    exchange: item.exchange,
  }));
}

export async function getHistory(
  symbol: string,
  interval: "1day" | "1week" = "1day",
  outputsize = 90
): Promise<CandlePoint[]> {
  const res = await fetch(
    `${BASE_URL}/time_series?symbol=${encodeURIComponent(
      symbol
    )}&interval=${interval}&outputsize=${outputsize}&apikey=${apiKey()}`,
    { next: { revalidate: 300 } }
  );
  const data = await res.json();

  if (data.status === "error" || !data.values) {
    throw new Error(data.message || `Could not fetch history for ${symbol}`);
  }

  return data.values
    .map((v: any) => ({ date: v.datetime, close: Number(v.close) }))
    .reverse();
}
