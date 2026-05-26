<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  <xsl:output method="html" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Delulu Dating — Sitemap</title>
        <style>
          :root {
            color-scheme: light dark;
            font-family: ui-sans-serif, system-ui, sans-serif;
          }
          body {
            margin: 0;
            padding: 2rem;
            background: #eef9ff;
            color: #0f172a;
          }
          @media (prefers-color-scheme: dark) {
            body {
              background: #0b1220;
              color: #e2e8f0;
            }
            a { color: #7dd3fc; }
            th { background: #1e293b; }
            tr:nth-child(even) { background: rgba(255, 255, 255, 0.04); }
          }
          h1 { margin-top: 0; }
          p { max-width: 48rem; line-height: 1.5; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1.5rem;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
          }
          @media (prefers-color-scheme: dark) {
            table { background: #111827; }
          }
          th, td {
            padding: 0.75rem 1rem;
            text-align: left;
            border-bottom: 1px solid rgba(148, 163, 184, 0.25);
            vertical-align: top;
          }
          th { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.04em; }
          a { color: #0284c7; word-break: break-all; }
          .muted { font-size: 0.875rem; opacity: 0.8; }
        </style>
      </head>
      <body>
        <h1>Delulu Dating sitemap</h1>
        <p>
          Human-readable view for browsers. Search engines read the underlying XML at
          <a href="/sitemap.xml">/sitemap.xml</a>.
        </p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last modified</th>
              <th>Change frequency</th>
              <th>Priority</th>
              <th>Alternates</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="s:urlset/s:url">
              <tr>
                <td><a href="{s:loc}"><xsl:value-of select="s:loc" /></a></td>
                <td class="muted"><xsl:value-of select="s:lastmod" /></td>
                <td class="muted"><xsl:value-of select="s:changefreq" /></td>
                <td class="muted"><xsl:value-of select="s:priority" /></td>
                <td class="muted">
                  <xsl:for-each select="xhtml:link">
                    <div><xsl:value-of select="@hreflang" />: <xsl:value-of select="@href" /></div>
                  </xsl:for-each>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
