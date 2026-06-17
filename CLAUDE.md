# CLAUDE.md — Church App Project Rules

You are helping build a church membership + engagement web app. Read this file fully at the start of every session and follow it as binding instructions.

---

## Project overview

A **Progressive Web App (PWA)** that works on iPhone, Android, and desktop browsers, installable to the home screen, expandable to native app stores later.

**Stack**
- Next.js (App Router) + React + **TypeScript**
- Tailwind CSS
- Supabase (Postgres database, Auth, Storage, Row Level Security)
- Hosting: Vercel
- Email: Resend
- Scripture: bible-api.com (no key) — cache results in the database
- Phase 2: Stripe (giving), unlisted YouTube/Vimeo embeds (pastor video)

**Two user roles:** `member` and `admin`. Admin sees extra screens (approvals, event editor, message composer).

---

## ⛔ WORKFLOW RULES — these are mandatory and override convenience

### 1. One phase = one branch = one pull request
- **Never commit directly to `main`.** Always work on a branch named `phase-<N>-<short-slug>` (e.g. `phase-4-member-directory`).
- Do all work for the current phase on that branch.
- When the phase is complete, open a pull request and **STOP**.

### 2. STOP after each phase — wait for human merge
- After opening the PR, summarize what's in it and **do not begin the next phase.**
- Only start the next phase when I explicitly say so (e.g. "PR merged, proceed to Phase N+1"). Treat a merged PR as the signal that the phase is accepted.
- If I ask you to start a new phase but the previous PR is still open/unmerged, remind me and wait.

### 3. Update the activity log BEFORE every commit
- Append to `ACTIVITY_LOG.md` (create it in Phase 0 if missing). Never overwrite prior entries.
- Each entry uses this format:

```
## [YYYY-MM-DD HH:MM] Phase <N> — <phase name>
- Branch: phase-<N>-<slug>
- What I did: <plain-language summary>
- Files added/changed: <list>
- Key decisions: <any tradeoffs or choices made>
- Manual steps you must do: <e.g. add an env var, run a SQL migration in Supabase>
- Status: <in progress | PR opened #<num> | blocked: reason>
- Next: <what the next phase should tackle>
```

### 4. Commit and PR conventions
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Commit in small, logical chunks within the phase — not one giant commit.
- Open the PR with the GitHub CLI:
  ```
  gh pr create --title "Phase <N>: <name>" --body "<summary + checklist + manual steps>"
  ```
- The PR body must include: what changed, how to test it, any manual steps (env vars, SQL to run), and a checklist of the phase's "definition of done."

### 5. Definition of done (every phase)
A phase is only "done" when: code builds with no errors (`npm run build`), it runs locally, `ACTIVITY_LOG.md` is updated, lint passes, the branch is pushed, and the PR is open. Confirm each of these in your closing summary.

---

## Security rules (non-negotiable)
- **Never commit secrets.** All keys live in `.env.local`; ensure `.env*` is in `.gitignore`. Reference env vars by name in PR notes; never print their values.
- **Row Level Security ON for every Supabase table.** No table ships without RLS policies.
- Members default to **private** contact info; sharing is opt-in.
- Use Supabase Auth for all sessions; never roll custom auth.
- For any future payment work, use Stripe Checkout/hosted flows — never handle raw card data.

## Coding conventions
- TypeScript everywhere; no `any` unless justified in a comment.
- Keep components small; colocate by feature under `app/` and `components/`.
- Server-side data access via Supabase server client; never expose the service-role key to the browser.
- Mobile-first Tailwind. Accessible markup (labels, alt text, focus states).
- Add a short comment at the top of each new file saying what it does.

## When unsure
- If a decision affects data model, auth, or money, pause and ask me before coding it.
- Prefer the simplest thing that satisfies the phase. Defer Phase 2+ features.
