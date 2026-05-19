import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MethodologyClient } from "@/components/methodology/MethodologyClient";
import { metadataForLocalePage } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return metadataForLocalePage(locale, "methodology");
}

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MethodologyClient />;
}
