import { DM_Sans, JetBrains_Mono, Phudu } from "next/font/google";

export const phudu = Phudu({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-lab-display",
  display: "swap",
  adjustFontFallback: true,
});

export const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-lab-mono",
  display: "swap",
});

export const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-lab-sans",
  display: "swap",
});

export const fontVariables = `${phudu.variable} ${jetbrainsMono.variable} ${dmSans.variable}`;
