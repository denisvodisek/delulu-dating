import type { Metadata } from "next";
import { dmSans, fontVariables } from "@/lib/fonts";
import "./globals.css";

const OG_HERO_IMAGE = "/hero-hk-street.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://delulu.dating"),
  title: {
    default: "Delulu Dating",
    template: "%s",
  },
  description: "Hong Kong dating reality calculator — how delulu is your boyfriend wishlist?",
  applicationName: "Delulu Dating",
  category: "entertainment",
  icons: {
    icon: [{ url: "/brand-mark.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    siteName: "Delulu Dating",
    type: "website",
    images: [{ url: OG_HERO_IMAGE, width: 1024, height: 1024, alt: "Delulu Dating" }],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_HERO_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full ${fontVariables}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4524750683541633"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${dmSans.className} flex min-h-full flex-col antialiased`}>{children}</body>
    </html>
  );
}
