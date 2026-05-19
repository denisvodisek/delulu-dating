import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DM_Sans, JetBrains_Mono, Phudu } from "next/font/google";
import { routing } from "@/i18n/routing";
import { ClientAnalytics } from "@/components/analytics/ClientAnalytics";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LocaleHtmlLang } from "@/components/i18n/LocaleHtmlLang";

const phudu = Phudu({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-lab-display",
  display: "swap",
  adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-lab-mono",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-lab-sans",
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
        lang={locale === "zh" ? "zh-HK" : "en"}
        className={`${dmSans.className} ${phudu.variable} ${jetbrainsMono.variable} ${dmSans.variable} candy-bg text-lab-on-surface selection:bg-[#30c7ff]/40 selection:text-lab-on-surface flex min-h-full flex-1 flex-col overflow-x-hidden font-lab-body`}
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
