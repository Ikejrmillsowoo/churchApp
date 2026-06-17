-- 0001_init_profiles.sql
-- Core extensions, shared helper functions, and the `profiles` table with Row Level Security.
-- profiles holds one row per auth user, including their role and approval status.

create extension if not exists pgcrypto;

-- Touch updated_at on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles: one row per Supabase auth user.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  email        text,
  phone        text,
  role         text not null default 'member' check (role in ('member', 'admin')),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  -- Contact info is private by default; sharing into the directory is opt-in (Phase 4).
  share_email  boolean not null default false,
  share_phone  boolean not null default false,
  -- Whether the member accepts mass emails (Phase 7).
  email_opt_in boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper: is the current user an admin?
-- SECURITY DEFINER so it reads profiles without invoking RLS (avoids policy recursion).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: the current user's approval status (or null if no profile yet).
-- SECURITY DEFINER for the same recursion-avoidance reason.
create or replace function public.current_status()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select status from public.profiles where id = auth.uid();
$$;

-- Block non-admins from changing their own role or status (e.g. self-approval or
-- self-promotion to admin). Admins may change anything.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role then
    raise exception 'Only admins can change a profile role';
  end if;
  if new.status is distinct from old.status then
    raise exception 'Only admins can change a profile status';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileged
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

-- RLS policies ---------------------------------------------------------------

-- Users can always read their own profile.
create policy "Profiles: view own"
  on public.profiles for select
  using (id = auth.uid());

-- Approved members can browse other approved members (the directory, Phase 4).
create policy "Profiles: approved members can view approved"
  on public.profiles for select
  using (status = 'approved' and public.current_status() = 'approved');

-- Admins can read every profile (approvals screen, Phase 4).
create policy "Profiles: admin can view all"
  on public.profiles for select
  using (public.is_admin());

-- A user may create only their own profile, as a pending member (no self-promotion).
create policy "Profiles: insert own as pending member"
  on public.profiles for insert
  with check (id = auth.uid() and role = 'member' and status = 'pending');

-- A user may update their own profile; the trigger above blocks role/status edits.
create policy "Profiles: update own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins may update any profile (approve / reject / promote).
create policy "Profiles: admin update all"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admins may delete profiles.
create policy "Profiles: admin delete"
  on public.profiles for delete
  using (public.is_admin());
