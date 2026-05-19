import type { MetadataRoute } from "next";
import { INDEXABLE_PATHS, localeUrl } from "@/lib/seo/site";
import { routing } from "@/i18n/routing";

const PRIORITY: Record<string, number> = {
  "": 1,
  quiz: 0.9,
  methodology: 0.75,
  crowd: 0.8,
};

const CHANGE_FREQ: Record<string, MetadataRoute.Sitemap[number]["changeFrequency"]> = {
  "": "weekly",
  quiz: "monthly",
  methodology: "monthly",
  crowd: "daily",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of INDEXABLE_PATHS) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = localeUrl(locale, path);
    }
    languages["x-default"] = localeUrl(routing.defaultLocale, path);

    for (const locale of routing.locales) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified,
        changeFrequency: CHANGE_FREQ[path],
        priority: PRIORITY[path],
        alternates: { languages },
      });
    }
  }

  return entries;
}
