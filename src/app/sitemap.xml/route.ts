import { buildSitemapXml } from "@/lib/seo/sitemap-xml";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildSitemapXml(), {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
