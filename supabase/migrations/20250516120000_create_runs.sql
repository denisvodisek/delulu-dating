-- Anonymous run log: one row per POST /api/run (service role from Next.js).
-- RLS on with no policies: only service_role can access via PostgREST.
-- Idempotent: safe if applied via MCP first, then replayed from GitHub.

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  locale text,
  constraint runs_locale_check check (
    locale is null
    or locale in ('en', 'zh')
  )
);

comment on table public.runs is 'Anonymous quiz completion events for delulu.dating counters.';

create index if not exists runs_created_at_idx on public.runs (created_at desc);

alter table public.runs enable row level security;
