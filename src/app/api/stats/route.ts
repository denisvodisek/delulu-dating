import { NextResponse } from "next/server";
import { publicSocialCounter } from "@/lib/runs-counter";

/** Theatrical counter for the homepage — always synthetic (not DB-backed). */
export async function GET() {
  return NextResponse.json({ runsToday: publicSocialCounter() });
}
