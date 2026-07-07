# Deployment guide (Phase 8)

How to take the Church App live on **Vercel** with **Supabase** and **Resend**. Work through
the parts in order. Steps marked 🖐️ are manual dashboard actions you perform.

---

## Environment variables

Set all of these in Vercel → Project → **Settings → Environment Variables** (Production, and
Preview if you want previews to work). Never commit real values — they live only here and in
your local `.env.local`.

| Variable | Public? | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase → Settings → API → `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** | Supabase → Settings → API → `service_role` key |
| `CRON_SECRET` | **secret** | Generate one: `openssl rand -hex 32` |
| `RESEND_API_KEY` | **secret** | resend.com → API Keys |
| `EMAIL_FROM` | config | e.g. `Church App <noreply@yourdomain.org>` (verified Resend domain) |
| `NEXT_PUBLIC_SITE_URL` | public | Your live URL, e.g. `https://church-app.vercel.app` (no trailing slash) |

---

## Part 1 — Supabase (production database) 🖐️

1. Use your existing Supabase project (or create a dedicated production one).
2. **Run all migrations in order** in the SQL Editor if they aren't applied yet:
   `0001_init_profiles` → `0002_events` → `0003_daily_verse` → `0004_handle_new_user` →
   `0005_fix_protect_trigger` → `0006_member_directory` → `0007_messages`.
3. Confirm every table shows **RLS enabled** (Table Editor): `profiles`, `events`,
   `daily_verse`, `messages`.
4. **Auth → URL Configuration**:
   - Site URL: your live URL (e.g. `https://church-app.vercel.app`)
   - Redirect URLs: add `https://church-app.vercel.app/**`
5. **Auth → Providers → Email**: decide whether to require email confirmation. If on, set the
   **Confirm signup** template link to
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/`.
   (Password reset works with the default template via `/auth/callback`.)

## Part 2 — Resend (email) 🖐️

1. Create a Resend account and **verify your sending domain** (Domains → add DNS records).
2. Create an **API key** → this is `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to an address on the verified domain. (The `onboarding@resend.dev` default
   only delivers to your own Resend account email — fine for a first test, not for members.)

## Part 3 — Vercel (deploy) 🖐️

1. vercel.com → **Add New → Project** → import the `churchApp` GitHub repo.
2. Framework preset auto-detects **Next.js**; leave build/output settings default.
3. Add all **7 environment variables** from the table above (Production).
4. Click **Deploy**. Note the assigned URL.
5. **Set `NEXT_PUBLIC_SITE_URL` to that URL** and, if it differs from what you guessed,
   update the Supabase Site URL + redirect list (Part 1.4), then **redeploy** so the new
   `NEXT_PUBLIC_*` values are baked in.

## Part 4 — Cron (scripture of the day)

- The daily job is configured in `vercel.json` (`/api/cron/daily-verse`, 05:00 UTC). Vercel
  registers it automatically on deploy and sends `Authorization: Bearer $CRON_SECRET`.
- Verify under Vercel → **Settings → Cron Jobs**. You can **Run** it once manually to seed
  today's verse, or hit it yourself:
  `curl -H "Authorization: Bearer $CRON_SECRET" https://<your-app>/api/cron/daily-verse`

---

## Part 5 — Go-live smoke test ✅

Run through this on the **live URL** after deploying:

- [ ] Visiting any app page while logged out redirects to `/login`.
- [ ] **Sign up** a new account → lands as a pending member; a `profiles` row is created.
- [ ] **Approve** that member from `/admin/approvals` (as an admin account).
- [ ] Approved member appears in `/directory`; toggling share on `/profile` shows/hides
      email & phone.
- [ ] **Admin creates an event** (`/admin/events`); it shows on `/calendar`; **Add to my
      calendar** downloads a working `.ics`.
- [ ] **Verse of the day** appears on the home screen (after the cron runs or a manual trigger).
- [ ] **Admin sends a message** (`/admin/messages`) to approved members; email arrives; the
      **unsubscribe** link flips the member out of the next send.
- [ ] **Forgot password** → email link → `/update-password` → sign in with the new password.
- [ ] **PWA install**: on a phone, Safari/Chrome → "Add to Home Screen"; the app opens
      standalone with the cross icon.

## First admin on production

Sign up, then in the Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin', status = 'approved'
where email = 'you@example.com';
```

## Troubleshooting

- **Auth emails point to localhost** → `NEXT_PUBLIC_SITE_URL` and/or the Supabase Site URL
  still point to localhost. Fix both and redeploy.
- **Reset/confirm link hits an error** → the target path isn't in the Supabase redirect
  allow-list, or the email template token_hash link is wrong.
- **Emails don't send** → `RESEND_API_KEY` missing, or `EMAIL_FROM` isn't on a verified domain.
- **No verse on home** → the cron hasn't run yet; trigger it manually (Part 4).
