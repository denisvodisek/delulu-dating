"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

export function SiteHeader() {
  const t = useTranslations("nav");
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/55 backdrop-blur-md">
      <div className="page-shell flex max-w-full items-center justify-between gap-2 py-3">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "shrink-0 text-sm font-extrabold tracking-tight text-primary sm:text-base",
          )}
        >
          {t("brand")}
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <LocaleSwitcher />
          <Link
            href="/methodology"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-xs font-semibold sm:text-sm",
            )}
          >
            {t("howShort")}
          </Link>
        </div>
      </div>
    </header>
  );
}
