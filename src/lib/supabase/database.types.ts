/**
 * Mirrors `public.runs` — keep aligned with `supabase/migrations/*`.
 * Used for typed inserts from the app; regenerate if you add columns.
 */
export type RunRow = {
  id: string;
  created_at: string;
  locale: string | null;
};

export type RunInsert = {
  locale: "en" | "zh";
  created_at?: string;
};
