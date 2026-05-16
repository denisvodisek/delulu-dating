# Delulu Dating (`delulu.dating`)

Kawaii Hong Kong dating reality calculator — **women seeking men** (day 1). Next.js 16 + Tailwind v4 + shadcn + next-intl (EN / 繁中) + GSAP + R3F + Vercel Analytics.

## Scripts

```bash
npm run dev
npm run build
npm run test
```

## Env (optional)

Copy `.env.example` to `.env.local`.

- `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` — optional PostHog (wired in `ClientAnalytics` when key is set)
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — optional `runs` table for real counters
- `NEXT_PUBLIC_MONETIZATION` — set to `on` after 10k users to show partner slots

## `POST /api/run` (Supabase)

When Supabase env is set, the route validates JSON (`locale` ∈ `en`|`zh` only), rejects oversized bodies, and applies a **best-effort in-memory rate limit** (per server instance / IP). On Vercel this is **not** a substitute for edge rate limiting or a WAF — enable platform limits or Upstash if the endpoint is abused.

**Locale / `<html lang>`:** `next-intl` sets the `NEXT_LOCALE` cookie and we set `lang` on the locale subtree wrapper (`[locale]/layout`) plus a small client sync to `document.documentElement.lang` for SPA navigations. The root `<html lang="en">` is a fallback for crawlers that only fetch the shell.

## Supabase `runs` table (optional)

```sql
create table runs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  locale text
);
```

## Licence

Private / all rights reserved unless you say otherwise.
