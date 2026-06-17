# Activity Log

A durable, append-only record of work on the Church App. One entry per phase.
Never overwrite prior entries.

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
- Status: in progress (pushed to branch; PR not yet opened)
- Next: Phase 1 — add the Supabase client (browser + server helpers), a `.env.local.example` listing env var names, and SQL migrations with Row Level Security for the `profiles`, `events`, and `daily_verse` tables.
