import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { RunInsert } from "@/lib/supabase/database.types";
import { createServiceSupabase } from "@/lib/supabase/service";

const bodySchema = z.object({
  locale: z.enum(["en", "zh"]).optional(),
});

const MAX_BODY = 512;

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

  const locale = parsedBody.data.locale ?? "en";

  try {
    const supabase = await createServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const row: RunInsert = {
      locale,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("runs").insert(row);
    if (error) {
      return NextResponse.json({ ok: false, error: "db" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
