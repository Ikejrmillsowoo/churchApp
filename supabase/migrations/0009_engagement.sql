-- Migration: engagement — likes and comments on posts (P3). Depends on helpers from
-- 0001 (is_admin, current_status, set_updated_at) and the posts table from 0008.

create table if not exists public.post_likes (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

-- Approved participants and admins can see who liked what (needed for counts).
create policy "Post likes: approved can view"
  on public.post_likes for select
  using (public.current_status() = 'approved' or public.is_admin());

-- A caller may like a published post as themselves only.
create policy "Post likes: approved can like"
  on public.post_likes for insert
  with check (
    user_id = auth.uid()
    and (public.current_status() = 'approved' or public.is_admin())
    and exists (
      select 1 from public.posts
      where posts.id = post_id and posts.status = 'published'
    )
  );

-- A caller may remove their own like.
create policy "Post likes: remove own"
  on public.post_likes for delete
  using (user_id = auth.uid());

-- comments -------------------------------------------------------------------

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  author_id  uuid references auth.users (id) on delete set null,
  body       text not null,
  hidden     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- Only admins may change a comment's hidden flag (moderation); the author-or-admin
-- update policy below still lets an author edit their own comment body.
create or replace function public.protect_comment_hidden_field()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;
  if new.hidden is distinct from old.hidden then
    raise exception 'Only admins can hide or unhide a comment';
  end if;
  return new;
end;
$$;

create trigger comments_protect_hidden
  before update on public.comments
  for each row execute function public.protect_comment_hidden_field();

-- Approved participants and admins can read comments that are not hidden.
create policy "Comments: approved can view visible"
  on public.comments for select
  using (
    not hidden
    and (public.current_status() = 'approved' or public.is_admin())
  );

-- Admins can view everything, including hidden comments (to moderate/unhide).
create policy "Comments: admin view all"
  on public.comments for select
  using (public.is_admin());

-- A caller may comment as themselves on a published post.
create policy "Comments: approved can comment"
  on public.comments for insert
  with check (
    author_id = auth.uid()
    and (public.current_status() = 'approved' or public.is_admin())
    and exists (
      select 1 from public.posts
      where posts.id = post_id and posts.status = 'published'
    )
  );

-- Authors edit their own comment body; admins can update any comment.
create policy "Comments: author or admin update"
  on public.comments for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

-- Authors delete their own comment; admins delete any (moderation).
create policy "Comments: author or admin delete"
  on public.comments for delete
  using (author_id = auth.uid() or public.is_admin());
