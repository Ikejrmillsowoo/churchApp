-- Migration: posts feed (P2). The coach writes posts; approved participants read the
-- published ones. Mirrors the events/daily_verse pattern from earlier phases and reuses
-- the set_updated_at, is_admin, and current_status helpers from 0001.

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  author_id    uuid references auth.users (id) on delete set null,
  title        text,
  body         text not null,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  pinned       boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.posts enable row level security;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Approved participants can read published posts.
create policy "Posts: approved can view published"
  on public.posts for select
  using (status = 'published' and public.current_status() = 'approved');

-- The coach (admin) can view everything, including drafts.
create policy "Posts: admin view all"
  on public.posts for select
  using (public.is_admin());

-- Only the coach creates, edits, or deletes posts.
create policy "Posts: admin insert"
  on public.posts for insert
  with check (public.is_admin());

create policy "Posts: admin update"
  on public.posts for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Posts: admin delete"
  on public.posts for delete
  using (public.is_admin());
