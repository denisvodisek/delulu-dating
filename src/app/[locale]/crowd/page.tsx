import { setRequestLocale } from "next-intl/server";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";

export default async function CrowdPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LeaderboardClient />;
}
