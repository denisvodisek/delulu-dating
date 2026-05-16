import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { locale?: string };
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    await supabase.from("runs").insert({
      locale: body.locale ?? "en",
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
