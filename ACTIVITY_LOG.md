# Activity Log

A durable, append-only record of work on the Church App. One entry per phase.
Never overwrite prior entries.

## [2026-06-17 05:00] Phase 2 — Authentication & roles
- Branch: claude/optimistic-goodall-do8aqs
- What I did: Implemented email/password signup, login, and logout with Supabase Auth; added route-protection middleware so only signed-in users can reach the app; added a DB trigger that creates a pending-member profile on signup; and added server-side `getProfile`/`isAdmin` helpers. The home screen now greets the member and shows their approval status with a sign-out button.
- Files added/changed: middleware.ts, lib/supabase/middleware.ts, lib/auth.ts, lib/types.ts, app/auth/actions.ts, app/auth/confirm/route.ts, app/login/page.tsx, app/signup/page.tsx, app/error/page.tsx, app/page.tsx, supabase/migrations/0004_handle_new_user.sql
- Key decisions:
  - New signups become pending members via a `SECURITY DEFINER` trigger (`handle_new_user`) on `auth.users`, rather than an app-side insert. This works even when email confirmation is on (no session yet) and keeps role/status at their safe defaults ('member'/'pending').
  - Auth uses `@supabase/ssr` cookie sessions. Middleware refreshes the session and redirects unauthenticated users to `/login`; public prefixes are `/login`, `/signup`, `/auth`, `/error`.
  - Auth flows are server actions (`login`, `signup`, `signOut`) so credentials never touch client JS state; errors/messages are passed back via query params.
  - Added `app/auth/confirm/route.ts` to handle the email confirmation link (verifyOtp) — requires Supabase redirect URL config (see manual steps).
  - Defined a local `Profile` type (lib/types.ts) to avoid `any`; can be swapped for Supabase-generated types later.
- Manual steps you must do:
  - Run the new migration `supabase/migrations/0004_handle_new_user.sql` in the Supabase SQL Editor.
  - In Supabase → Authentication → URL Configuration, set the Site URL (e.g. http://localhost:3000) and add `…/auth/confirm` as a redirect URL. For local testing you may disable "Confirm email" under Authentication → Providers → Email to skip the email step.
  - Ensure `.env.local` has the three Supabase keys filled in.
  - To create your first admin, sign up, then in the SQL Editor run:
    `update public.profiles set role = 'admin', status = 'approved' where email = 'you@example.com';`
- Status: in progress (pushed to branch; PR not yet opened)
- Next: Phase 3 — PWA shell & navigation (manifest, icons, service worker, mobile-first bottom nav with admin-only items hidden for members).

## [2026-06-17 04:40] Phase 1 — Supabase client + database schema
- Branch: claude/optimistic-goodall-do8aqs
- What I did: Added the Supabase client helpers (browser, server, and a server-only admin client), a `.env.local.example` listing the required env var names (no values), and SQL migrations creating the `profiles`, `events`, and `daily_verse` tables — each with Row Level Security enabled and explicit policies.
- Files added/changed: package.json, package-lock.json, .gitignore, .env.local.example, lib/supabase/client.ts, lib/supabase/server.ts, lib/supabase/admin.ts, supabase/migrations/0001_init_profiles.sql, supabase/migrations/0002_events.sql, supabase/migrations/0003_daily_verse.sql, supabase/migrations/README.md
- Key decisions:
  - Used `@supabase/ssr` for cookie-based auth (browser + server clients) and `@supabase/supabase-js` for a separate service-role admin client guarded by `import "server-only"` so it can never be bundled to the browser.
  - profiles model: `role` ('member' | 'admin'), `status` ('pending' | 'approved' | 'rejected'), plus contact fields and opt-in flags (`share_email`, `share_phone`, `email_opt_in`) that later phases need. Contact info is private by default.
  - Used text columns with CHECK constraints rather than Postgres enums (simpler to evolve).
  - Added `SECURITY DEFINER` helpers `is_admin()` and `current_status()` so RLS policies can check role/status without recursively querying `profiles`.
  - A trigger blocks non-admins from changing their own `role`/`status`; the insert policy forces self-signups to be pending members (no self-promotion).
  - RLS summary: profiles — users read/update own, approved members read approved (directory), admins manage all; events — approved members read, admins manage; daily_verse — any signed-in user reads, admins manage (the Phase 6 cron uses the service role key, which bypasses RLS).
  - Deferred the signup trigger/handle_new_user and middleware session refresh to Phase 2 (auth).
- Manual steps you must do:
  - Create a Supabase project, then copy `.env.local.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (Supabase dashboard → Settings → API).
  - In the Supabase SQL Editor, run the three migrations in order: `0001_init_profiles.sql`, `0002_events.sql`, `0003_daily_verse.sql` (see `supabase/migrations/README.md`).
  - Verify each table shows RLS enabled in the Table Editor.
- Status: in progress (pushed to branch; PR not yet opened)
- Next: Phase 2 — signup/login/logout with Supabase Auth, create a pending member profile row on signup, route protection, and an isAdmin check.

## [2026-06-17 04:20] Phase 0 — Project scaffold & logging
- Branch: claude/optimistic-goodall-do8aqs
- What I did: Scaffolded the Next.js app (App Router, TypeScript, Tailwind, ESLint), added a project README and this activity log, replaced the default demo home page with a minimal church landing page, and confirmed the production build passes.
- Files added/changed: package.json, package-lock.json, tsconfig.json, next.config.ts, next-env.d.ts, eslint.config.mjs, postcss.config.mjs, .gitignore, AGENTS.md, app/layout.tsx, app/page.tsx, app/globals.css, app/favicon.ico, public/, README.md, ACTIVITY_LOG.md
- Key decisions:
  - Used `create-next-app` with App Router, no `src/` directory (app/ and components/ live at the repo root per CLAUDE.md), and the `@/*` import alias.
  - Stack versions: Next.js 16, React 19, Tailwind CSS 4.
  - Package name set to `church-app` (the repo folder `churchApp` is invalid as an npm package name due to the capital letter).
  - Removed the unused demo SVGs and Vercel/Next marketing content from the starter.
  - Kept CLAUDE.md and BUILD_GUIDE.md at the repo root.
- Manual steps you must do: None for Phase 0. (Run `npm install` after pulling, since `node_modules` is git-ignored.)
- Status: PR opened #1
- Next: Phase 1 — add the Supabase client (browser + server helpers), a `.env.local.example` listing env var names, and SQL migrations with Row Level Security for the `profiles`, `events`, and `daily_verse` tables.
