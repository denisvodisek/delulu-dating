"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const navBase =
  "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-200";

const navActive =
  "bg-gradient-to-r from-pink-200/95 to-fuchsia-200/95 text-fuchsia-950 shadow-sm ring-2 ring-pink-300/55";

const navIdle = "text-fuchsia-900/80 hover:bg-pink-100/90 hover:text-fuchsia-950";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="border-pink-200/50 fixed top-0 z-50 flex h-20 w-full items-center justify-between border-b bg-white/80 px-4 shadow-[0_8px_32px_rgba(236,72,153,0.08)] backdrop-blur-xl md:px-16">
      <Link
        href="/"
        className="group font-lab-display flex items-center gap-2.5 md:gap-3"
      >
        <Image
          src="/brand-mark.svg"
          alt=""
          width={40}
          height={40}
          className="h-9 w-9 shrink-0 rounded-[11px] shadow-md ring-1 ring-pink-200/70 transition group-hover:ring-pink-400/90 md:h-10 md:w-10"
          priority
        />
        <span className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent uppercase md:text-xl">
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
