"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const navLink =
  "font-lab-mono text-lab-mono px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 hover:bg-lab-primary hover:text-lab-on-primary";

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="border-lab-outline bg-lab-surface fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b px-4 md:px-16">
      <Link href="/" className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lab-primary text-2xl leading-none">biotech</span>
        <span className="font-lab-display text-lab-primary text-xl uppercase tracking-tighter md:text-2xl">
          {t("brand")}
        </span>
      </Link>
      <nav className="hidden items-center gap-4 md:flex md:gap-6 lg:gap-8">
        <Link href="/quiz" className={cn(navLink, "text-lab-primary")}>
          {t("analysis")}
        </Link>
        <Link href="/methodology" className={cn(navLink, "text-lab-on-surface-variant")}>
          {t("methodology")}
        </Link>
        <a href="#specimens" className={cn(navLink, "text-lab-on-surface-variant")}>
          {t("archive")}
        </a>
      </nav>
      <LocaleSwitcher variant="lab" />
    </header>
  );
}
