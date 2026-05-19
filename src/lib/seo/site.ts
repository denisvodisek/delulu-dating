import { routing } from "@/i18n/routing";

export const SITE_URL = "https://delulu.dating";

/** Paths under `[locale]` that should appear in the sitemap (no leading slash). */
export const INDEXABLE_PATHS = ["", "quiz", "methodology", "crowd"] as const;

export type IndexablePath = (typeof INDEXABLE_PATHS)[number];

export function localeUrl(locale: string, path: IndexablePath | "" = ""): string {
  const segment = path === "" ? "" : `/${path}`;
  return `${SITE_URL}/${locale}${segment}`;
}

export function hreflangAlternates(path: IndexablePath | "" = ""): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = localeUrl(locale, path === "" ? "" : path);
  }
  languages["x-default"] = localeUrl(routing.defaultLocale, path === "" ? "" : path);
  return languages;
}
