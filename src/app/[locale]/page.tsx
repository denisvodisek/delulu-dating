import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import LandingClient from "@/components/landing/LandingClient";
import { JsonLd } from "@/components/seo/JsonLd";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  return (
    <>
      <JsonLd locale={locale} name={t("title")} description={t("description")} />
      <LandingClient />
    </>
  );
}
