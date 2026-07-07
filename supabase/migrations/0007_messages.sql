-- Migration: mass email messaging (Phase 7).
-- Adds a log of admin-sent messages and a per-member unsubscribe token used by the
-- public unsubscribe link. Depends on helpers from 0001 (is_admin).

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  subject         text not null,
  body            text not null,
  audience        text not null check (audience in ('approved', 'pending')),
  sent_by         uuid references auth.users (id) on delete set null,
  recipient_count integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Only admins can read or record sends.
create policy "Messages: admin select"
  on public.messages for select
  using (public.is_admin());

create policy "Messages: admin insert"
  on public.messages for insert
  with check (public.is_admin());

-- Stable per-member token for one-click email unsubscribe (used by the public
-- /unsubscribe route, which updates email_opt_in via the service role key).
alter table public.profiles
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();
