export type Quote = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
};

export type CandlePoint = {
  date: string;
  close: number;
};

export type SearchResult = {
  symbol: string;
  name: string;
  exchange: string;
};

export type WatchlistItem = {
  id: string;
  user_id: string;
  symbol: string;
  added_at: string;
};

export type Holding = {
  id: string;
  user_id: string;
  symbol: string;
  shares: number;
  avg_cost: number;
};

export type Transaction = {
  id: string;
  user_id: string;
  symbol: string;
  type: "buy" | "sell";
  shares: number;
  price: number;
  executed_at: string;
};

export type Profile = {
  id: string;
  username: string;
  cash_balance: number;
};
