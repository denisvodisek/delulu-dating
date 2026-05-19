import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";
import { metadataForLocalePage } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalePage(locale, "crowd");
}

export default async function CrowdPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LeaderboardClient />;
}
