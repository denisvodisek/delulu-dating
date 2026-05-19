import { NextResponse } from "next/server";
import { aggregateRuns } from "@/lib/runs-leaderboard";
import { createServiceSupabase } from "@/lib/supabase/service";

export const revalidate = 60;

export async function GET() {
  try {
    const supabase = await createServiceSupabase();
    if (!supabase) {
      return NextResponse.json({
        ok: true,
        configured: false,
        stats: aggregateRuns([]),
      });
    }

    const { data, error } = await supabase
      .from("runs")
      .select(
        "id, created_at, locale, tier, seeker, probability, age_min, age_max, min_height_cm, min_monthly_income_hkd, marital, expat_preference, education_min, no_smoking, no_kids_from_prev, requires_own_flat, requires_car",
      )
      .not("tier", "is", null)
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      return NextResponse.json({ ok: false, error: "db" }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      stats: aggregateRuns(data ?? []),
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
