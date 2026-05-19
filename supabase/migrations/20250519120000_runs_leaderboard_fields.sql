-- Anonymous aggregate fields for crowd stats / tier distribution.
-- Idempotent: safe to replay.

alter table public.runs
  add column if not exists tier text,
  add column if not exists seeker text,
  add column if not exists probability double precision,
  add column if not exists age_min smallint,
  add column if not exists age_max smallint,
  add column if not exists min_height_cm smallint,
  add column if not exists min_monthly_income_hkd integer,
  add column if not exists marital text,
  add column if not exists expat_preference text,
  add column if not exists education_min text,
  add column if not exists no_smoking boolean,
  add column if not exists no_kids_from_prev boolean,
  add column if not exists requires_own_flat boolean,
  add column if not exists requires_car boolean;

alter table public.runs drop constraint if exists runs_tier_check;
alter table public.runs add constraint runs_tier_check check (
  tier is null
  or tier in ('realistic', 'picky', 'very_picky', 'delulu', 'god')
);

alter table public.runs drop constraint if exists runs_seeker_check;
alter table public.runs add constraint runs_seeker_check check (
  seeker is null
  or seeker in ('woman_seeking_man', 'man_seeking_woman')
);

alter table public.runs drop constraint if exists runs_locale_check;
alter table public.runs add constraint runs_locale_check check (
  locale is null
  or locale in ('en', 'zh-HK', 'zh')
);

create index if not exists runs_tier_idx on public.runs (tier) where tier is not null;
