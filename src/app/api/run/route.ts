import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { RunInsert } from "@/lib/supabase/database.types";
import { createServiceSupabase } from "@/lib/supabase/service";

const tierSchema = z.enum(["realistic", "picky", "very_picky", "delulu", "god"]);
const seekerSchema = z.enum(["woman_seeking_man", "man_seeking_woman"]);

const bodySchema = z.object({
  locale: z.enum(["en", "zh-HK"]).optional(),
  tier: tierSchema.optional(),
  seeker: seekerSchema.optional(),
  probability: z.number().finite().min(0).max(1).optional(),
  ageMin: z.number().int().min(18).max(99).optional(),
  ageMax: z.number().int().min(18).max(99).optional(),
  minHeightCm: z.number().int().min(140).max(220).optional(),
  minMonthlyIncomeHKD: z.number().int().min(0).max(500_000).optional(),
  marital: z.enum(["never", "not_married_ok", "any"]).optional(),
  expatPreference: z.enum(["any", "local_only", "expat_preferred"]).optional(),
  educationMin: z.enum(["any", "degree", "postgrad"]).optional(),
  noSmoking: z.boolean().optional(),
  noKidsFromPrev: z.boolean().optional(),
  requiresOwnFlat: z.boolean().optional(),
  requiresCar: z.boolean().optional(),
});

const MAX_BODY = 2048;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`run:${ip}`, 24, 900_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let parsed: unknown = {};
  if (raw.trim()) {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }
  }

  const parsedBody = bodySchema.safeParse(parsed);
  if (!parsedBody.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const d = parsedBody.data;
  const locale = d.locale ?? "en";

  try {
    const supabase = await createServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const row: RunInsert = {
      locale,
      created_at: new Date().toISOString(),
    };

    if (d.tier) row.tier = d.tier;
    if (d.seeker) row.seeker = d.seeker;
    if (d.probability != null) row.probability = d.probability;
    if (d.ageMin != null) row.age_min = d.ageMin;
    if (d.ageMax != null) row.age_max = d.ageMax;
    if (d.minHeightCm != null) row.min_height_cm = d.minHeightCm;
    if (d.minMonthlyIncomeHKD != null) row.min_monthly_income_hkd = d.minMonthlyIncomeHKD;
    if (d.marital) row.marital = d.marital;
    if (d.expatPreference) row.expat_preference = d.expatPreference;
    if (d.educationMin) row.education_min = d.educationMin;
    if (d.noSmoking != null) row.no_smoking = d.noSmoking;
    if (d.noKidsFromPrev != null) row.no_kids_from_prev = d.noKidsFromPrev;
    if (d.requiresOwnFlat != null) row.requires_own_flat = d.requiresOwnFlat;
    if (d.requiresCar != null) row.requires_car = d.requiresCar;

    const { error } = await supabase.from("runs").insert(row);
    if (error) {
      return NextResponse.json({ ok: false, error: "db" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
