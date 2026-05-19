import type { Metadata } from "next";
import { hreflangAlternates, localeUrl, type IndexablePath } from "@/lib/seo/site";

const OG_HERO_IMAGE = "/hero-hk-street.png";

export function buildPageMetadata({
  locale,
  path = "",
  title,
  description,
  heroImageAlt,
  noIndex = false,
}: {
  locale: string;
  path?: IndexablePath | "";
  title: string;
  description: string;
  heroImageAlt?: string;
  noIndex?: boolean;
}): Metadata {
  const canonical = localeUrl(locale, path);
  const alternates = {
    canonical,
    languages: hreflangAlternates(path),
  };

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Delulu Dating",
      locale: locale === "zh-HK" ? "zh_HK" : "en_HK",
      type: "website",
      images: [
        {
          url: OG_HERO_IMAGE,
          width: 1024,
          height: 1024,
          alt: heroImageAlt ?? "Delulu Dating — Hong Kong dating reality calculator",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_HERO_IMAGE],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  };
}
