import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ResultClient from "@/components/result/ResultClient";
import { MonetizationSlot } from "@/components/monetization/MonetizationSlot";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "result" });
  return buildPageMetadata({
    locale,
    title: t("metaTitle"),
    description: t("metaDescription"),
    noIndex: true,
  });
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ResultClient locale={locale}>
      <MonetizationSlot />
    </ResultClient>
  );
}
