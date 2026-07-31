# Ledger — Market Tracker & Paper Trading

A full-stack stock tracking and simulated trading app: live quotes, historical
charts, watchlists, and a $100,000 paper-trading portfolio with real P&L
tracking.

**Stack:** Next.js 14 (App Router, TypeScript) · Supabase (Postgres + Auth) ·
Twelve Data (market data API) · Tailwind CSS · Recharts · Vercel

## Features

- **Live ticker tape** — scrolling strip of real-time quotes across every page
- **Search** — debounced ticker/company lookup with a results dropdown
- **Stock detail page** — quote, daily stats, and a historical price chart
- **Watchlist** — signed-in users can star tickers to track
- **Paper trading** — buy/sell any ticker against a simulated cash balance,
  with holdings and P&L computed from live prices
- **Auth** — email/password via Supabase, with row-level security so users
  only ever see their own data

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com),
   then run `supabase/schema.sql` in the SQL editor. This creates the
   `profiles`, `watchlist`, `holdings`, and `transactions` tables, RLS
   policies, and the `execute_trade` function that atomically handles buys
   and sells.

3. **Get a free Twelve Data API key** at
   [twelvedata.com/pricing](https://twelvedata.com/pricing) (free tier: 800
   requests/day, which is plenty for a portfolio project).

4. **Copy the env template and fill in your keys**
   ```bash
   cp .env.local.example .env.local
   ```

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Deploying

Push this repo to GitHub, then import it in [Vercel](https://vercel.com).
Add the three environment variables from `.env.local` in the Vercel project
settings before the first deploy.

## Project structure

```
app/
  page.tsx                 Home page — market snapshot
  stock/[symbol]/page.tsx  Stock detail — chart + trade form
  watchlist/page.tsx       Signed-in user's saved tickers
  portfolio/page.tsx       Cash balance, holdings, P&L, trade history
  login/page.tsx           Supabase email/password auth
  api/
    quote/route.ts         GET /api/quote?symbol=AAPL
    search/route.ts        GET /api/search?q=appl
    history/route.ts       GET /api/history?symbol=AAPL
components/                UI building blocks (chart, cards, forms, ticker)
lib/
  stockApi.ts               Twelve Data wrapper (server-side only — keeps the API key secret)
  supabase/                 Browser + server Supabase clients
supabase/schema.sql          Database schema, RLS policies, execute_trade()
```

## Notes for extending this

- **Rate limits**: the free Twelve Data tier is capped; the API routes cache
  responses briefly (`revalidate`) to stay under it. For a resume-ready demo,
  that's plenty — mention the caching strategy in interviews as a deliberate
  tradeoff.
- **A natural next feature** given a forecasting background: add a simple
  moving-average or trend indicator panel on the stock detail page — it's a
  good way to differentiate this from a template clone.
- **Real-time quotes**: Twelve Data also offers a WebSocket feed on paid
  tiers if you want push updates instead of polling later on.
