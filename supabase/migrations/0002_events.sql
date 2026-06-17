-- 0002_events.sql
-- Church events calendar (Phase 5). Admins manage events; approved members read them.
-- Depends on helpers from 0001 (is_admin, current_status, set_updated_at).

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  location    text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.events enable row level security;

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- Approved members (and admins) can view events.
create policy "Events: approved members and admins can view"
  on public.events for select
  using (public.current_status() = 'approved' or public.is_admin());

-- Only admins create, edit, or delete events.
create policy "Events: admin insert"
  on public.events for insert
  with check (public.is_admin());

create policy "Events: admin update"
  on public.events for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Events: admin delete"
  on public.events for delete
  using (public.is_admin());
