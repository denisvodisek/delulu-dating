"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { DeluluCloudLogo } from "@/components/brand/DeluluCloudLogo";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b-2 border-lab-on-surface bg-lab-surface-container-lowest/95 px-4 shadow-[0_4px_0_rgba(10,31,45,0.07)] backdrop-blur-xl md:px-16">
      <Link href="/" className="group min-w-0 shrink" aria-label={t("brand")}>
        <DeluluCloudLogo />
      </Link>
      <nav className="hidden items-center gap-2 md:flex md:gap-2">
        <Link
          href="/quiz"
          className={cn(
            "puffy-btn puffy-btn-sm",
            pathname === "/quiz" ? "puffy-btn-lavender" : "puffy-btn-soft",
          )}
        >
          {t("analysis")}
        </Link>
        <Link
          href="/methodology"
          className={cn(
            "puffy-btn puffy-btn-sm",
            pathname === "/methodology" ? "puffy-btn-lavender" : "puffy-btn-soft",
          )}
        >
          {t("methodology")}
        </Link>
        <Link
          href="/crowd"
          className={cn(
            "puffy-btn puffy-btn-sm",
            pathname === "/crowd" ? "puffy-btn-lavender" : "puffy-btn-soft",
          )}
        >
          {t("crowd")}
        </Link>
        <Link href="/#specimens" className="puffy-btn puffy-btn-sm puffy-btn-soft">
          {t("archive")}
        </Link>
      </nav>
      <LocaleSwitcher variant="lab" />
    </header>
  );
}
