-- Migration: cached "scripture of the day" table and Row Level Security (Phase 6).
-- A daily Vercel Cron job fetches a verse from
-- bible-api.com and upserts one row per date using the service role key (which bypasses RLS).
-- Depends on helpers from 0001 (is_admin).

create table if not exists public.daily_verse (
  id         uuid primary key default gen_random_uuid(),
  verse_date date not null unique,
  reference  text not null,
  text       text not null,
  created_at timestamptz not null default now()
);

alter table public.daily_verse enable row level security;

-- Any signed-in user can read the cached verse.
create policy "Daily verse: authenticated can view"
  on public.daily_verse for select
  using (auth.uid() is not null);

-- Admins may manage entries manually. The cron job uses the service role key and is not
-- subject to these policies.
create policy "Daily verse: admin insert"
  on public.daily_verse for insert
  with check (public.is_admin());

create policy "Daily verse: admin update"
  on public.daily_verse for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Daily verse: admin delete"
  on public.daily_verse for delete
  using (public.is_admin());
