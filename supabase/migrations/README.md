# Supabase migrations

SQL migrations for the Church App database. Run them **in numeric order**.

| File                       | Creates                                                              |
| -------------------------- | ------------------------------------------------------------------- |
| `0001_init_profiles.sql`   | `pgcrypto`, helper functions, and the `profiles` table (+ RLS)      |
| `0002_events.sql`          | The `events` table (+ RLS)                                           |
| `0003_daily_verse.sql`     | The `daily_verse` table (+ RLS)                                      |

Every table ships with Row Level Security **enabled** and explicit policies.

## How to apply (Supabase dashboard)

1. Open your project at <https://supabase.com/dashboard> → **SQL Editor**.
2. Open a **New query**, paste the contents of `0001_init_profiles.sql`, and **Run**.
3. Repeat for `0002_events.sql`, then `0003_daily_verse.sql`, in order.
4. Verify under **Table Editor** that `profiles`, `events`, and `daily_verse` exist
   and each shows the green **RLS enabled** badge.

## How to apply (Supabase CLI, optional)

If you use the CLI with a linked project:

```bash
supabase db push
```

## Notes

- `is_admin()` and `current_status()` are `SECURITY DEFINER` helpers so RLS policies can
  check a user's role/status without recursively querying `profiles`.
- A trigger blocks non-admins from changing their own `role` or `status`.
- The migrations are idempotent where practical (`if not exists`), but policies are not —
  re-running a file that already created its policies will error on the duplicate policy.
