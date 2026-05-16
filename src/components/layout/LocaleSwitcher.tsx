"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const LOCALES = ["en", "zh"] as const;

export function LocaleSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className="flex shrink-0 rounded-full border border-foreground/15 bg-white/70 p-0.5 shadow-sm backdrop-blur-sm"
      role="group"
      aria-label={t("language")}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => router.replace(pathname, { locale: code })}
          className={cn(
            "min-w-[2.75rem] rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors",
            locale === code
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {code === "en" ? t("langEn") : t("langZh")}
        </button>
      ))}
    </div>
  );
}
