import type { Metadata } from "next";
import { dmSans, fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://delulu.dating"),
  title: "Delulu Dating",
  description: "Hong Kong dating reality calculator",
  icons: {
    icon: [{ url: "/brand-mark.svg", type: "image/svg+xml" }],
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
      </head>
      <body className={`${dmSans.className} flex min-h-full flex-col antialiased`}>{children}</body>
    </html>
  );
}
