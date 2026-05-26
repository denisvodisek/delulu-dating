import { INDEXABLE_PATHS, localeUrl } from "@/lib/seo/site";
import { routing } from "@/i18n/routing";

const PRIORITY: Record<string, number> = {
  "": 1,
  quiz: 0.9,
  methodology: 0.75,
  crowd: 0.8,
};

const CHANGE_FREQ: Record<string, string> = {
  "": "weekly",
  quiz: "monthly",
  methodology: "monthly",
  crowd: "daily",
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildSitemapXml(lastModified = new Date()): string {
  const lastmod = lastModified.toISOString();
  const urls: string[] = [];

  for (const path of INDEXABLE_PATHS) {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = localeUrl(locale, path);
    }
    languages["x-default"] = localeUrl(routing.defaultLocale, path);

    for (const locale of routing.locales) {
      const loc = localeUrl(locale, path);
      const alternates = Object.entries(languages)
        .map(
          ([lang, href]) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`,
        )
        .join("\n");

      urls.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
${alternates}
    <lastmod>${lastmod}</lastmod>
    <changefreq>${CHANGE_FREQ[path]}</changefreq>
    <priority>${PRIORITY[path]}</priority>
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
}
