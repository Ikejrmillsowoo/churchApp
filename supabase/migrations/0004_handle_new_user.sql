-- Migration: auto-create a profile row when a new auth user signs up (Phase 2).
-- Runs as SECURITY DEFINER so it can insert past RLS even before the user's first session
-- (e.g. when email confirmation is required). role/status use the table defaults
-- ('member' / 'pending'), satisfying "new signups are pending members".

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
