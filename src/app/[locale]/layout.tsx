import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ClientAnalytics } from "@/components/analytics/ClientAnalytics";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LocaleHtmlLang } from "@/components/i18n/LocaleHtmlLang";

const OG_HERO_IMAGE = "/hero-hk-street.png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  const tLanding = await getTranslations({ locale, namespace: "landing" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "zh-HK" ? "zh_HK" : "en_HK",
      type: "website",
      images: [
        {
          url: OG_HERO_IMAGE,
          width: 1024,
          height: 1024,
          alt: tLanding("heroImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [OG_HERO_IMAGE],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "zh-HK")) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <>
      <LocaleHtmlLang locale={locale} />
      <div
        lang={locale === "zh-HK" ? "zh-HK" : "en"}
        className="candy-bg text-lab-on-surface selection:bg-[#30c7ff]/40 selection:text-lab-on-surface flex min-h-full flex-1 flex-col overflow-x-hidden font-lab-body"
      >
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
          <ClientAnalytics />
        </NextIntlClientProvider>
      </div>
    </>
  );
}
