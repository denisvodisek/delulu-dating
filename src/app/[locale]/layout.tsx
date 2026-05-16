import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Fraunces, Noto_Sans_HK } from "next/font/google";
import { routing } from "@/i18n/routing";
import { ClientAnalytics } from "@/components/analytics/ClientAnalytics";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LocaleHtmlLang } from "@/components/i18n/LocaleHtmlLang";
import { KawaiiBg } from "@/components/webgl/KawaiiBg";

const notoHK = Noto_Sans_HK({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

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
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "zh" ? "zh_HK" : "en_HK",
      type: "website",
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
  if (!routing.locales.includes(locale as "en" | "zh")) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <>
      <LocaleHtmlLang locale={locale} />
      <div
        className={`${notoHK.className} ${fraunces.variable} flex min-h-full flex-1 flex-col`}
      >
        <KawaiiBg />
        <NextIntlClientProvider messages={messages}>
          <SiteHeader />
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
          <ClientAnalytics />
        </NextIntlClientProvider>
      </div>
    </>
  );
}
