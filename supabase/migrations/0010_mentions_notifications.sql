-- Migration: @mentions and notifications (P4). Adds a unique `handle` to every profile
-- (auto-generated, backfilled for existing rows) and a `notifications` table that the app
-- writes to directly when it detects @handle mentions in a published post or a comment.
-- Depends on helpers from 0001 and the handle_new_user trigger from 0004.

alter table public.profiles
  add column if not exists handle text unique;

-- Turns a name/email-local-part into a lowercase, alphanumeric-only handle, appending a
-- numeric suffix until it is unique. Used both for new signups and the one-time backfill.
create or replace function public.generate_unique_handle(base text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned   text;
  candidate text;
  suffix    int := 0;
begin
  cleaned := lower(regexp_replace(coalesce(base, ''), '[^a-zA-Z0-9]+', '', 'g'));
  if cleaned = '' then
    cleaned := 'participant';
  end if;

  candidate := cleaned;
  while exists (select 1 from public.profiles where handle = candidate) loop
    suffix := suffix + 1;
    candidate := cleaned || suffix::text;
  end loop;

  return candidate;
end;
$$;

-- Extend the signup trigger (0004) to also assign a handle to new profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, handle)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    public.generate_unique_handle(
      coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- One-time backfill: assign a handle to every profile created before this migration.
do $$
declare
  r record;
begin
  for r in select id, full_name, email from public.profiles where handle is null loop
    update public.profiles
    set handle = public.generate_unique_handle(coalesce(r.full_name, split_part(r.email, '@', 1)))
    where id = r.id;
  end loop;
end;
$$;

alter table public.profiles alter column handle set not null;

-- notifications ----------------------------------------------------------------

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users (id) on delete cascade,
  actor_id     uuid not null references auth.users (id) on delete cascade,
  type         text not null default 'mention' check (type in ('mention')),
  post_id      uuid references public.posts (id) on delete cascade,
  comment_id   uuid references public.comments (id) on delete cascade,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- You only ever see your own notifications.
create policy "Notifications: view own"
  on public.notifications for select
  using (recipient_id = auth.uid());

-- The app writes a notification as the acting user, naming a real, approved recipient
-- who isn't themselves. This runs with the caller's own authenticated client (same
-- pattern as comments/likes) rather than a privileged service-role write.
create policy "Notifications: create as self for a valid recipient"
  on public.notifications for insert
  with check (
    actor_id = auth.uid()
    and recipient_id <> auth.uid()
    and exists (
      select 1 from public.profiles
      where id = recipient_id and status = 'approved'
    )
  );

-- Recipients can mark their own notifications read (or otherwise manage them).
create policy "Notifications: update own"
  on public.notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create policy "Notifications: delete own"
  on public.notifications for delete
  using (recipient_id = auth.uid());
