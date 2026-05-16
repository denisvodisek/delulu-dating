import { NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/service";
import { estimateRunsToday, getHongKongDayBounds } from "@/lib/runs-counter";

export async function GET() {
  const supabase = await createServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ runsToday: estimateRunsToday() });
  }
  const { startIso, endIso } = getHongKongDayBounds();
  const { count, error } = await supabase
    .from("runs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startIso)
    .lt("created_at", endIso);
  if (error || count == null) {
    return NextResponse.json({ runsToday: estimateRunsToday() });
  }
  return NextResponse.json({ runsToday: count });
}
