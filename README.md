# coachIke

A Progressive Web App (PWA) for a coaching program — posts, discussion, and updates,
installable on iPhone, Android, and desktop browsers. Originally built as a church app
and rebranded in place; see `BUILD_GUIDE.md` for the original phase roadmap and
`CLAUDE.md` for the project rules.

## Stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS**
- **Supabase** (Postgres, Auth, Storage, Row Level Security) — _added in Phase 1_
- **Vercel** hosting — _added in Phase 8_
- **Resend** email — _added in Phase 7_

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start the local dev server |
| `npm run build` | Production build           |
| `npm run start` | Run the production build   |
| `npm run lint`  | Lint the codebase          |

## Environment variables

Secrets live in `.env.local` (git-ignored) — never commit them. The required
variable names are documented per phase in each pull request and will be added to
a `.env.local.example` starting in Phase 1.

## Deployment

To take the app live on Vercel (with Supabase + Resend), follow **`DEPLOYMENT.md`** — it
covers the production env vars, Supabase/Resend setup, the Vercel import, the daily-verse
cron, and an end-to-end go-live smoke test.

## Project conventions

See `CLAUDE.md` for the binding workflow, security, and coding rules. Progress is
tracked in `ACTIVITY_LOG.md`, with one branch and pull request per phase.
