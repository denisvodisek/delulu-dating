"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const LOCALES = ["en", "zh"] as const;

type LocaleSwitcherProps = {
  variant?: "default" | "lab";
};

export function LocaleSwitcher({ variant = "default" }: LocaleSwitcherProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  if (variant === "lab") {
    return (
      <div
        className="font-lab-mono text-lab-mono flex shrink-0 items-center gap-1 text-xs font-semibold tracking-wide"
        role="group"
        aria-label={t("language")}
      >
        {LOCALES.map((code, i) => (
          <span key={code} className="flex items-center gap-1">
            {i > 0 ? <span className="text-lab-outline">|</span> : null}
            <button
              type="button"
              onClick={() => router.replace(pathname, { locale: code })}
              className={cn(
                "cursor-pointer rounded-sm border border-transparent px-3 py-1.5 uppercase transition-all",
                locale === code
                  ? "border-lab-on-surface/20 bg-lab-primary font-bold text-lab-on-primary shadow-sm"
                  : "text-lab-on-surface-variant hover:border-lab-outline-variant hover:bg-lab-surface-container-lowest hover:text-lab-on-surface",
              )}
            >
              {code === "en" ? t("langEn") : t("langZh")}
            </button>
          </span>
        ))}
      </div>
    );
  }

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
