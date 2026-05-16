import { NextResponse } from "next/server";

export async function GET() {
  const { estimateRunsToday } = await import("@/lib/runs-counter");
  return NextResponse.json({ runsToday: estimateRunsToday() });
}
