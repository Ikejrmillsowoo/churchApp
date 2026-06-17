# Building the Church App with Claude Code — Step-by-Step Guide

This guide walks you through building the app using **Claude Code**, with a **pull request after every phase** and an **activity log** maintained throughout. The workflow rules are enforced by the `CLAUDE.md` file (provided separately) that you'll drop into your repo — Claude Code reads it automatically every session.

---

## Part A — One-time setup (do this once)

### A1. Install prerequisites
- **Git** — version control. Verify: `git --version`
- **GitHub CLI (`gh`)** — needed so Claude Code can open pull requests. Install from cli.github.com, then run `gh auth login`.
- **Node.js 18+** — needed if you install Claude Code via npm, and to run the Next.js app either way. Verify: `node --version` (use nvm to install/upgrade).

### A2. Install Claude Code
Pick one method:
- **Native installer (recommended, no Node.js needed):**
  - Mac/Linux/WSL: `curl -fsSL https://claude.ai/install.sh | bash`
  - Windows (PowerShell): `irm https://claude.ai/install.ps1 | iex`
- **npm (requires Node.js 18+):** `npm install -g @anthropic-ai/claude-code`

Verify and authenticate:
```
claude --version
claude          # then complete browser login with your Claude subscription
/doctor         # run inside Claude Code to confirm a healthy install
```

### A3. Create the GitHub repo
1. Create an empty **private** repo on GitHub called `church-app`.
2. On your machine:
   ```
   mkdir church-app && cd church-app
   git init
   git remote add origin https://github.com/<you>/church-app.git
   ```
3. **Protect `main`** (GitHub → repo Settings → Branches → add rule for `main`, require a pull request before merging). This makes the "PR before proceeding" rule structural, not just a habit.

### A4. Drop in the rules file
Copy the provided **`CLAUDE.md`** into the repo root. This is what makes Claude Code branch-per-phase, log activity, open a PR each phase, and stop and wait for your merge.

### A5. Free accounts to create (you'll paste keys into `.env.local` as phases need them)
- **Supabase** (database/auth/storage)
- **Vercel** (hosting)
- **Resend** (email)
- Later: **Twilio** (SMS — start its ~2-week registration early), **Stripe** (giving)

---

## Part B — How the loop works each phase

For every phase you'll do the same four-step cycle:

1. **Start Claude Code** in the repo folder: `claude`
2. **Paste the phase prompt** (from Part C below).
3. Claude Code creates a `phase-N-...` branch, builds the feature, updates `ACTIVITY_LOG.md`, commits, pushes, and **opens a PR — then stops.**
4. **You review the PR on GitHub**, do any listed manual steps (env vars, SQL), merge it, then tell Claude Code: **"PR merged, proceed to Phase N+1."**

Because `CLAUDE.md` forbids committing to `main` and requires a stop after each PR, you get a review gate at every phase automatically.

> Want finer control? Tell Claude Code "split this phase into one PR per step" and it will open a PR after each sub-step instead of each phase.

---

## Part C — The phase prompts (paste one per cycle)

Each prompt assumes `CLAUDE.md` is in the repo. Keep prompts short; the rules file carries the workflow.

### Phase 0 — Project scaffold & logging
```
Read CLAUDE.md. Start Phase 0 on a new branch.
Scaffold a Next.js app (App Router, TypeScript, Tailwind, ESLint) in this repo.
Create ACTIVITY_LOG.md with the format from CLAUDE.md and add the first entry.
Add a clean .gitignore (include .env*), a README, and confirm `npm run build` passes.
Then open the PR and stop.
```

### Phase 1 — Supabase + database schema
```
PR merged, proceed to Phase 1.
Add the Supabase client (browser + server helpers) and a .env.local.example listing the
env var NAMES needed (no values).
Create SQL migrations for these tables with Row Level Security policies on each:
profiles, events, daily_verse. Use the data model: profiles has role and status fields.
Put the SQL in a /supabase/migrations folder and document in the PR exactly what I must
run in the Supabase dashboard. Update the log, open the PR, stop.
```

### Phase 2 — Authentication & roles
```
PR merged, proceed to Phase 2.
Implement signup, login, logout using Supabase Auth. On signup, create a profiles row with
status='pending' and role='member'. Add route protection so only logged-in users see the
app, and an isAdmin check. Update the log, open the PR, stop.
```

### Phase 3 — PWA shell & navigation
```
PR merged, proceed to Phase 3.
Add the PWA manifest, icons, and service worker so the app is installable ("Add to Home
Screen"). Build the base mobile-first layout and bottom nav (Home, Directory, Calendar,
Messages; admin-only items hidden for members). Update the log, open the PR, stop.
```

### Phase 4 — Member signup + admin approval + directory
```
PR merged, proceed to Phase 4.
Build the public signup flow into profiles (status='pending'). Build an admin screen listing
pending members with approve/reject. Build the directory of approved members; members can
hide their own phone/email (opt-in sharing), enforced by RLS. Update the log, open the PR, stop.
```

### Phase 5 — Events calendar
```
PR merged, proceed to Phase 5.
Admin: create/edit/delete events. Members: a list/month view from the events table, plus an
"Add to my calendar" button that generates a downloadable .ics file. Update the log, open the PR, stop.
```

### Phase 6 — Scripture of the day
```
PR merged, proceed to Phase 6.
Add a daily job (Vercel Cron) that fetches a verse from bible-api.com once per day and caches
it in the daily_verse table. The home screen reads from the cache (reference + text). Provide a
curated list of references to rotate through. Update the log, open the PR, stop.
```

### Phase 7 — Email mass messaging
```
PR merged, proceed to Phase 7.
Admin compose screen: subject + body, choose audience (all approved / pending). Send via Resend
to members where email_opt_in is true. Include a working unsubscribe link. Log each send in the
messages table. Update the log, open the PR, stop.
```

### Phase 8 — Deploy to Vercel
```
PR merged, proceed to Phase 8.
Wire up Vercel deployment from main with the needed env vars (document them in the PR). Confirm
the live URL installs as a PWA on a phone and that signup→approval→directory works end to end.
Update the log, open the PR, stop.
```

### Later phases (Phase 2 of the product roadmap)
Run these the same way, one PR each, once the MVP is live:
- **Phase 9 — SMS messaging** (Twilio; start its 10DLC registration during Phase 0 since carrier review takes ~10–15 days; respect sms_opt_in and "Reply STOP").
- **Phase 10 — Online giving** (Stripe Checkout: one-time first, then recurring, then fund selection).
- **Phase 11 — Ministry sign-ups** (ministries + ministry_members tables; group messaging).
- **Phase 12 — Pastor video messages** (embed unlisted YouTube/Vimeo on a Messages screen).
- **Phase 13 — Native apps** (wrap with Capacitor; submit to App Store $99/yr + Google Play $25 once).

---

## Part D — Keeping good logs (beyond ACTIVITY_LOG.md)
- `ACTIVITY_LOG.md` is your durable, reviewable record — Claude Code appends to it every phase per `CLAUDE.md`.
- The **PR history** on GitHub is your second log: each merged PR = one phase, with its description and diff.
- Claude Code also keeps local session transcripts, but the in-repo log + PR trail are what you'll actually rely on for review and handoff.

## Part E — Habits that keep this smooth
- Review each PR before merging; do the "manual steps" listed in the PR body (env vars, SQL) before testing.
- If a phase feels too big, tell Claude Code to split it into multiple PRs.
- Never paste real keys into the chat or commits — only into `.env.local` and Vercel's env settings.
- After merging, always give the explicit "proceed to Phase N+1" so Claude Code knows the gate is cleared.
