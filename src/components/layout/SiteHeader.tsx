"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const navBase =
  "rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-200";

const navActive =
  "bg-lab-primary text-lab-on-primary shadow-sm ring-2 ring-lab-on-surface/10";

const navIdle =
  "text-lab-on-surface-variant hover:bg-lab-surface-container-lowest hover:text-lab-on-surface border border-transparent hover:border-lab-outline-variant";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="border-lab-outline-variant fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b bg-lab-surface-container-lowest/90 px-4 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-xl md:px-16">
      <Link
        href="/"
        className="group font-lab-display flex items-center gap-2.5 md:gap-3"
      >
        <Image
          src="/brand-mark.svg"
          alt=""
          width={40}
          height={40}
          className="h-9 w-9 shrink-0 rounded-md ring-1 ring-lab-outline-variant transition group-hover:ring-lab-on-surface/25 md:h-10 md:w-10"
          priority
        />
        <span className="text-lab-on-surface text-lg font-extrabold tracking-tight uppercase md:text-xl">
          {t("brand")}
        </span>
      </Link>
      <nav className="hidden items-center gap-2 md:flex md:gap-1 lg:gap-2">
        <Link href="/quiz" className={cn(navBase, pathname === "/quiz" ? navActive : navIdle)}>
          {t("analysis")}
        </Link>
        <Link
          href="/methodology"
          className={cn(navBase, pathname === "/methodology" ? navActive : navIdle)}
        >
          {t("methodology")}
        </Link>
        <Link href="/#specimens" className={cn(navBase, navIdle)}>
          {t("archive")}
        </Link>
      </nav>
      <LocaleSwitcher variant="lab" />
    </header>
  );
}
