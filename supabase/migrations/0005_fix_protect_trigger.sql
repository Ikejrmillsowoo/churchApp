-- Migration: fix the profile-protection trigger so the first admin can be bootstrapped.
-- The original version blocked ALL role/status changes unless auth.uid() resolved to an
-- admin. In the SQL Editor and service-role contexts there is no end-user JWT, so
-- auth.uid() is null and even a superuser could not promote the first admin.
-- This replaces the function to also allow changes when auth.uid() is null (trusted
-- server / SQL contexts). RLS still controls who may issue the UPDATE in the first place.
-- Run this if you applied 0001 before this fix; on a fresh setup 0001 already includes it.

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or auth.uid() is null then
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
