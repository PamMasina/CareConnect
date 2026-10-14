# CareConnect — Patient Queue & Emergency App

A mobile-first progressive web app (PWA) that lets patients book appointments
online, check in to a real-time queue, and trigger a one-tap SOS that alerts
first responders — for a Cape Town community clinic.

## Tech stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Supabase (Auth, Postgres, Realtime, Row Level Security)
- vite-plugin-pwa (installable on Android/iOS home screen)

## Roles
`patient` · `doctor` · `nurse` · `first_responder` · `admin`

## 1. Supabase setup
1. Create a project at https://supabase.com
2. Open **SQL Editor** and run, in order:
   - `supabase/schema.sql`
   - `supabase/rls.sql`
   - `supabase/seed.sql`
3. In **Auth → Providers**, enable Email (confirm email optional for demos).
4. In **Database → Replication**, ensure `sos_alerts`, `appointments`, `queue_entries`
   are in the `supabase_realtime` publication (schema.sql does this).
5. Copy your **Project URL** and **anon public key**.

## 2. Environment
```bash
cp .env.example .env
```
Fill in:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 3. Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173

## 4. Build & deploy
```bash
npm run build   # output in dist/
```
Deploy `dist/` to Vercel, Netlify, or any static host.
- Vercel: `vercel` (uses vercel.json for SPA fallback)
- Netlify: drag-and-drop `dist/`; `_redirects` is included

### Install on a phone
After deploying over HTTPS, open the site on the phone and use
**Add to Home Screen** (Chrome/Android or Safari/iOS) to install the PWA.

## Creating staff accounts
Sign up normally and pick the role on the signup form (demo mode), or have an
admin change a user's role in the **Admin console → Users**.

## Project layout
```
src/
  components/Layout.tsx      App shell + bottom nav
  context/AuthContext.tsx    Auth + profile
  lib/                      supabase client, types
  pages/                    all screens
supabase/                   schema, RLS, seed SQL
public/                     icons, PWA manifest assets
```
