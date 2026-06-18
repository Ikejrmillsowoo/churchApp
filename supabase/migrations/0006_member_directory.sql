-- Migration: member directory with opt-in contact sharing (Phase 4).
-- Previously an approved member could read every other approved member's full row,
-- including raw email/phone. This replaces that broad policy with a masking view so:
--   * members can read only their OWN full row from the base table, and
--   * other approved members are visible only through `member_directory`, which hides
--     email/phone unless the owner opted in (share_email / share_phone).

-- Remove the policy that exposed full approved rows (incl. contact columns).
drop policy if exists "Profiles: approved members can view approved" on public.profiles;

-- Masking view. security_invoker = false: the view runs as its owner and applies its own
-- WHERE clause instead of the base-table RLS, while public.current_status() still reflects
-- the calling user — so only approved callers get rows, and only shared contact info shows.
create or replace view public.member_directory
with (security_invoker = false) as
  select
    p.id,
    p.full_name,
    case when p.share_email then p.email else null end as email,
    case when p.share_phone then p.phone else null end as phone
  from public.profiles p
  where p.status = 'approved'
    and public.current_status() = 'approved'
  order by p.full_name nulls last;

revoke all on public.member_directory from anon, authenticated;
grant select on public.member_directory to authenticated;
