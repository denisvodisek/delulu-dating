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

- `NEXT_PUBLIC_POSTHOG_KEY` — optional product analytics
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — optional `runs` table for real counters
- `NEXT_PUBLIC_MONETIZATION` — set to `on` after 10k users to show partner slots

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
