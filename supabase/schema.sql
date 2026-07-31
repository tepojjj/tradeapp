-- Run this in the Supabase SQL editor (or `supabase db push`) after creating your project.

-- ── Profiles ────────────────────────────────────────────────────────────────
-- One row per auth user. Starts everyone with $100,000 in simulated cash.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  cash_balance numeric(14, 2) not null default 100000.00,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Watchlist ───────────────────────────────────────────────────────────────
create table if not exists watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  symbol text not null,
  added_at timestamptz not null default now(),
  unique (user_id, symbol)
);

-- ── Holdings ────────────────────────────────────────────────────────────────
create table if not exists holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  symbol text not null,
  shares numeric(14, 4) not null default 0,
  avg_cost numeric(14, 4) not null default 0,
  unique (user_id, symbol)
);

-- ── Transactions ────────────────────────────────────────────────────────────
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  symbol text not null,
  type text not null check (type in ('buy', 'sell')),
  shares numeric(14, 4) not null,
  price numeric(14, 4) not null,
  executed_at timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table watchlist enable row level security;
alter table holdings enable row level security;
alter table transactions enable row level security;

create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

create policy "Users manage own watchlist" on watchlist for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read own holdings" on holdings for select using (auth.uid() = user_id);
create policy "Users read own transactions" on transactions for select using (auth.uid() = user_id);

-- Holdings and transactions are only ever written via execute_trade() below,
-- which runs with elevated privileges, so no direct insert/update policies
-- are needed for those tables.

-- ── Atomic trade execution ──────────────────────────────────────────────────
-- Wraps the cash/holdings/transaction updates in one transaction so a buy or
-- sell can never partially apply.
create or replace function execute_trade(
  p_symbol text,
  p_type text,
  p_shares numeric,
  p_price numeric
)
returns void as $$
declare
  v_user_id uuid := auth.uid();
  v_cash numeric;
  v_cost numeric := p_shares * p_price;
  v_current_shares numeric;
  v_current_avg_cost numeric;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select cash_balance into v_cash from profiles where id = v_user_id for update;

  if p_type = 'buy' then
    if v_cash < v_cost then
      raise exception 'Insufficient cash balance';
    end if;

    update profiles set cash_balance = cash_balance - v_cost where id = v_user_id;

    select shares, avg_cost into v_current_shares, v_current_avg_cost
      from holdings where user_id = v_user_id and symbol = p_symbol for update;

    if found then
      update holdings
        set shares = v_current_shares + p_shares,
            avg_cost = ((v_current_shares * v_current_avg_cost) + v_cost) / (v_current_shares + p_shares)
        where user_id = v_user_id and symbol = p_symbol;
    else
      insert into holdings (user_id, symbol, shares, avg_cost)
        values (v_user_id, p_symbol, p_shares, p_price);
    end if;

  elsif p_type = 'sell' then
    select shares into v_current_shares
      from holdings where user_id = v_user_id and symbol = p_symbol for update;

    if not found or v_current_shares < p_shares then
      raise exception 'Not enough shares to sell';
    end if;

    update profiles set cash_balance = cash_balance + v_cost where id = v_user_id;
    update holdings set shares = v_current_shares - p_shares
      where user_id = v_user_id and symbol = p_symbol;

  else
    raise exception 'Invalid trade type: %', p_type;
  end if;

  insert into transactions (user_id, symbol, type, shares, price)
    values (v_user_id, p_symbol, p_type, p_shares, p_price);
end;
$$ language plpgsql security definer;
