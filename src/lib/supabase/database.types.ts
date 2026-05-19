/**
 * Mirrors `public.runs` — keep aligned with `supabase/migrations/*`.
 */
export type DeluluTier = "realistic" | "picky" | "very_picky" | "delulu" | "god";

export type RunRow = {
  id: string;
  created_at: string;
  locale: string | null;
  tier: DeluluTier | null;
  seeker: "woman_seeking_man" | "man_seeking_woman" | null;
  probability: number | null;
  age_min: number | null;
  age_max: number | null;
  min_height_cm: number | null;
  min_monthly_income_hkd: number | null;
  marital: string | null;
  expat_preference: string | null;
  education_min: string | null;
  no_smoking: boolean | null;
  no_kids_from_prev: boolean | null;
  requires_own_flat: boolean | null;
  requires_car: boolean | null;
};

export type RunInsert = {
  locale: "en" | "zh-HK";
  created_at?: string;
  tier?: DeluluTier;
  seeker?: "woman_seeking_man" | "man_seeking_woman";
  probability?: number;
  age_min?: number;
  age_max?: number;
  min_height_cm?: number;
  min_monthly_income_hkd?: number;
  marital?: string;
  expat_preference?: string;
  education_min?: string;
  no_smoking?: boolean;
  no_kids_from_prev?: boolean;
  requires_own_flat?: boolean;
  requires_car?: boolean;
};
