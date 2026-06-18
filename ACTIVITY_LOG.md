# Activity Log

A durable, append-only record of work on the Church App. One entry per phase.
Never overwrite prior entries.

## [2026-06-18 19:00] Phase 6 — Scripture of the day
- Branch: claude/optimistic-goodall-do8aqs
- What I did: Added a daily "scripture of the day" feature. A Vercel Cron job fetches the day's curated verse from bible-api.com once a day and caches it in the daily_verse table; the home screen reads the cached verse (reference + text). The daily_verse table/RLS already existed from Phase 1.
- Files added/changed: lib/verses.ts, lib/types.ts (DailyVerse type), app/api/cron/daily-verse/route.ts, vercel.json, middleware.ts (exclude /api), .env.local.example (CRON_SECRET), app/(app)/page.tsx
- Key decisions:
  - Curated a 40-reference rotation (`lib/verses.ts`); the day's reference is chosen deterministically by day index, so it rotates daily and is stable within a day.
  - The cron endpoint uses the service-role admin client (bypasses RLS) to upsert by verse_date, and is idempotent (skips if today is already cached). It is protected by a `CRON_SECRET` bearer token that Vercel Cron sends automatically.
  - bible-api.com returns the public-domain WEB translation by default — no API key and no licensing concerns; results are cached so we don't hit the API per page view.
  - Excluded `/api/` from the auth middleware matcher so the cron endpoint isn't redirected to /login (it guards itself with the secret). Other API routes will likewise manage their own auth.
  - Home reads the most recent cached verse (not strictly today's) so it still shows something if a day's job hasn't run yet.
- Manual steps you must do:
  - Add a `CRON_SECRET` env var (a long random string) in `.env.local` and in the Vercel project settings.
  - Vercel Cron (configured in vercel.json) runs daily at 05:00 UTC once deployed — crons only fire on production deployments. To seed/test now, call the endpoint with the secret, e.g.:
    `curl -H "Authorization: Bearer $CRON_SECRET" https://<your-app>/api/cron/daily-verse`
    (locally: against http://localhost:3000 with the dev server running). It returns {status:"created"|"exists"}.
- Status: in progress (pushed to branch; PR not yet opened)
- Next: Phase 7 — email mass messaging (admin compose, audience selection, send via Resend to opted-in members, unsubscribe link, log sends in a messages table).

## [2026-06-18 18:00] Phase 5 — Events calendar
- Branch: claude/optimistic-goodall-do8aqs
- What I did: Built the events calendar. Admins can create/edit/delete events; approved members see an upcoming-events list and can download an .ics file ("Add to my calendar") per event. The events table and its RLS already existed from Phase 1, so no new migration was needed.
- Files added/changed: lib/types.ts (Event type), lib/datetime.ts, lib/ics.ts, components/event-form.tsx, app/(app)/calendar/page.tsx, app/(app)/calendar/[id]/ics/route.ts, app/(app)/admin/events/page.tsx, app/(app)/admin/events/new/page.tsx, app/(app)/admin/events/[id]/edit/page.tsx, app/(app)/admin/events/actions.ts, app/(app)/admin/page.tsx
- Key decisions:
  - Event writes go through the regular server client (RLS already restricts insert/update/delete to admins); actions also call isAdmin() as defense in depth.
  - .ics download is a route handler at /calendar/[id]/ics that runs as the signed-in user, so RLS controls who can fetch the event; it streams a single VEVENT with attachment headers.
  - Times are handled in UTC throughout (datetime-local inputs are interpreted as UTC and displayed as UTC) for deterministic server rendering. Per-user timezones are a deliberate later enhancement — noted so it isn't mistaken for a bug.
  - Reused the admin layout guard from Phase 4 so all /admin/events routes are admin-only; added an Events link on the admin hub.
- Manual steps you must do: None — the events schema/RLS shipped in Phase 1. (Sign in as admin → /admin/events → New event to test; approved members then see it on /calendar and can download the .ics.)
- Status: in progress (pushed to branch; PR not yet opened)
- Next: Phase 6 — scripture of the day (Vercel Cron fetches a verse daily from bible-api.com and caches it in daily_verse; home reads the cache).

## [2026-06-18 17:00] Phase 4 — Member signup + admin approval + directory
- Branch: claude/optimistic-goodall-do8aqs
- What I did: Built the admin approvals screen (approve/reject pending members), the approved-members directory with opt-in contact sharing, and a member profile page to set name/phone and choose what to share. Public signup into a pending profile was already in place (Phase 2 trigger).
- Files added/changed: supabase/migrations/0006_member_directory.sql, lib/types.ts, app/(app)/directory/page.tsx, app/(app)/profile/page.tsx, app/(app)/profile/actions.ts, app/(app)/admin/layout.tsx, app/(app)/admin/page.tsx, app/(app)/admin/actions.ts, app/(app)/admin/approvals/page.tsx, app/(app)/page.tsx
- Key decisions:
  - Opt-in contact sharing is enforced at the database level: migration 0006 drops the broad "approved can view approved" policy (which exposed every approved member's raw email/phone) and replaces it with a `member_directory` masking view. The view runs with `security_invoker = false` and gates on `current_status() = 'approved'`, so only approved callers get rows and email/phone appear only when `share_email`/`share_phone` are true. Members can now read only their OWN full row from the base table.
  - Admin approvals use the regular server client (RLS `is_admin()` permits the update); actions also call `isAdmin()` as defense in depth. Approve sets status='approved', reject sets status='rejected'.
  - Added an `(app)/admin/layout.tsx` guard so every /admin route is admin-only server-side, complementing the hidden nav tab.
  - Profile page lets members edit name/phone and toggle directory sharing (private by default); the auth email is shown read-only.
- Manual steps you must do:
  - Run `supabase/migrations/0006_member_directory.sql` in the Supabase SQL Editor.
  - To test end to end: sign up a second account (pending), approve it from /admin/approvals as your admin account, then have that member set a phone and toggle sharing on their /profile page and confirm it appears/disappears in /directory.
- Status: in progress (pushed to branch; PR not yet opened)
- Next: Phase 5 — events calendar (admin create/edit/delete events; members see a list/month view and can download an .ics file).

## [2026-06-18 16:00] Phase 3 — PWA shell & navigation
- Branch: claude/optimistic-goodall-do8aqs
- What I did: Made the app installable as a PWA (manifest, icons, service worker) and built the mobile-first authenticated shell with a fixed bottom navigation (Home, Directory, Calendar, Messages, plus an admin-only Admin tab). Added placeholder screens for the not-yet-built destinations.
- Files added/changed: app/manifest.ts, public/sw.js, public/icons/* (icon-192, icon-512, icon-maskable-512, apple-touch-icon), scripts/generate-icons.mjs, components/service-worker-register.tsx, components/bottom-nav.tsx, components/placeholder-screen.tsx, app/layout.tsx, app/(app)/layout.tsx, app/(app)/page.tsx (moved from app/page.tsx), app/(app)/directory/page.tsx, app/(app)/calendar/page.tsx, app/(app)/messages/page.tsx, app/(app)/admin/page.tsx, middleware.ts
- Key decisions:
  - Used Next's `app/manifest.ts` (served at `/manifest.webmanifest`) plus metadata/viewport for theme color, apple-touch-icon, and standalone display.
  - Generated placeholder icons (white cross on slate) with a dependency-free Node script (`scripts/generate-icons.mjs`) so no image library is added to the project — swap in real artwork later by editing/replacing the PNGs.
  - Service worker is network-first with a runtime cache fallback (minimal offline support + satisfies installability). Registered client-side via `ServiceWorkerRegister` in the root layout.
  - Introduced an `(app)` route group so the bottom nav shell wraps only signed-in screens; `/login`, `/signup`, `/error` stay outside it (no nav). The group layout fetches the profile and passes `isAdmin` to the nav.
  - Admin tab is hidden for non-admins in the nav, and `/admin` additionally redirects non-admins server-side (defense in depth).
  - Excluded `manifest.webmanifest`, `sw.js`, and `/icons/` from the auth middleware matcher so they are reachable when logged out (otherwise the manifest/SW would redirect to /login).
- Manual steps you must do: None. (PWA install is testable once deployed over HTTPS or via localhost; iOS uses "Add to Home Screen" from Safari's share sheet.)
- Status: in progress (pushed to branch; PR not yet opened)
- Next: Phase 4 — public signup into profiles (pending), admin approve/reject screen, and the approved-members directory with opt-in contact sharing enforced by RLS.

## [2026-06-17 05:00] Phase 2 — Authentication & roles
- Branch: claude/optimistic-goodall-do8aqs
- What I did: Implemented email/password signup, login, and logout with Supabase Auth; added route-protection middleware so only signed-in users can reach the app; added a DB trigger that creates a pending-member profile on signup; and added server-side `getProfile`/`isAdmin` helpers. The home screen now greets the member and shows their approval status with a sign-out button.
- Files added/changed: middleware.ts, lib/supabase/middleware.ts, lib/auth.ts, lib/types.ts, app/auth/actions.ts, app/auth/confirm/route.ts, app/login/page.tsx, app/signup/page.tsx, app/error/page.tsx, app/page.tsx, supabase/migrations/0004_handle_new_user.sql, supabase/migrations/0005_fix_protect_trigger.sql, supabase/migrations/0001_init_profiles.sql (trigger fix)
- Key decisions:
  - New signups become pending members via a `SECURITY DEFINER` trigger (`handle_new_user`) on `auth.users`, rather than an app-side insert. This works even when email confirmation is on (no session yet) and keeps role/status at their safe defaults ('member'/'pending').
  - Auth uses `@supabase/ssr` cookie sessions. Middleware refreshes the session and redirects unauthenticated users to `/login`; public prefixes are `/login`, `/signup`, `/auth`, `/error`.
  - Auth flows are server actions (`login`, `signup`, `signOut`) so credentials never touch client JS state; errors/messages are passed back via query params.
  - Added `app/auth/confirm/route.ts` to handle the email confirmation link (verifyOtp) — requires Supabase redirect URL config (see manual steps).
  - Defined a local `Profile` type (lib/types.ts) to avoid `any`; can be swapped for Supabase-generated types later.
- Manual steps you must do:
  - Run the new migrations `supabase/migrations/0004_handle_new_user.sql` and `supabase/migrations/0005_fix_protect_trigger.sql` in the Supabase SQL Editor. (0005 fixes a bootstrap bug where the protect trigger blocked promoting the first admin from the SQL Editor.)
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
