# Intervised — Website

This repository contains the source code for the Intervised public website: https://intervised.com

What this repo is for
- Host and version the site source (React + Vite + TypeScript).
- Provide a single place to review changes, open issues, and run CI/deploys.
- Serve as the canonical source for the site deployed to Vercel and connected to Supabase for persistence and auth.

Why it's on GitHub
- Version control: GitHub provides history, branches, and PR workflow so changes are reviewable and reversible.
- CI / Deploy: GitHub integrates with Vercel so pushes can trigger preview builds and production deployments.
- Collaboration: teammates and contractors can clone, file issues, and contribute via PRs.

Quick local development

Prerequisites: Node.js (18+ recommended), npm

1. Install dependencies

```bash
npm install
```

2. Create a local `.env` by copying the example

```bash
cp .env.example .env
# edit .env and fill in any private values (do not commit .env)
```

3. Run the dev server

```bash
npm run dev
```

Open http://localhost:5173 (or the port printed by Vite).

Deployment & environment variables
- Production is deployed to Vercel at `https://intervised.com`.
- The project uses Supabase for auth, chat/session persistence, and other backend services.
- Required client env variables (set in Vercel or your local `.env`):
   - `VITE_PUBLIC_SUPABASE_URL` — your Supabase project URL
   - `VITE_PUBLIC_SUPABASE_ANON_KEY` — publishable/anon key (safe client-side when RLS is enabled)
   - `VITE_PUBLIC_SITE_URL` — `https://intervised.com`

- Required server-only secrets (store in Vercel secrets / project settings; do NOT commit):
   - `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) — use only on the server

Supabase + Vercel integration
- This project uses the Supabase → Vercel integration to sync environment variables automatically.
- Keep server-only keys marked as Sensitive in Vercel. Public keys should be prefixed with `VITE_PUBLIC_` so Vite exposes them to the client bundle.

Security notes
- Never commit `.env` or secrets. `.env` is ignored in this repo and `.env.example` contains placeholders.
- If a secret was accidentally committed to the public repo, rotate the key immediately in Supabase and update Vercel secrets.

Further resources
- `lib/supabase/` — Supabase client and service helpers.
- `features/` — UI pages and components (Chat, Admin, Booking, Contact, etc.).