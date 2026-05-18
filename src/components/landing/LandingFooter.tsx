"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingFooter() {
  const t = useTranslations("landing");

  const pill =
    "rounded-sm border border-lab-outline-variant bg-lab-surface-container-lowest px-5 py-2.5 text-xs font-semibold text-lab-on-surface uppercase tracking-wide shadow-sm transition hover:border-lab-on-surface/20 hover:bg-lab-surface";

  return (
    <footer className="relative overflow-hidden border-t border-lab-outline-variant bg-lab-surface-container-lowest px-4 py-14 md:px-16 md:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-lab-outline-variant" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <p className="font-lab-display text-2xl font-extrabold tracking-tight text-lab-on-surface uppercase">
            {t("footerBrand")}
          </p>
          <p className="font-lab-body mt-3 max-w-md text-sm leading-relaxed text-lab-on-surface-variant">{t("footerLegal")}</p>
          <p className="font-lab-mono mt-4 text-[10px] uppercase tracking-[0.2em] text-lab-on-surface-variant">{t("footerTag")}</p>
        </div>

        <div className="flex flex-col gap-3 md:col-span-3">
          <p className="font-lab-mono text-[10px] font-bold tracking-widest text-lab-on-surface-variant uppercase">{t("footerColExplore")}</p>
          <Link href="/quiz" className={pill}>
            {t("footerLinkQuiz")}
          </Link>
          <Link href="/methodology" className={pill}>
            {t("footerMethodology")}
          </Link>
          <Link href="/#specimens" className={pill}>
            {t("footerLinkArchive")}
          </Link>
        </div>

        <div className="flex flex-col gap-3 md:col-span-4">
          <p className="font-lab-mono text-[10px] font-bold tracking-widest text-lab-on-surface-variant uppercase">{t("footerColMeta")}</p>
          <p className="font-lab-body text-sm text-lab-on-surface-variant">{t("footerBlurb")}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-sm border border-lab-outline-variant bg-lab-surface px-3 py-1 text-[10px] font-semibold text-lab-on-surface">
              {t("footerChipSatire")}
            </span>
            <span className="rounded-sm border border-lab-outline-variant bg-lab-primary/15 px-3 py-1 text-[10px] font-semibold text-lab-on-surface">
              {t("footerChipHK")}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-lab-outline-variant pt-8 text-center md:flex-row md:text-left">
        <span className="font-lab-mono text-[10px] text-lab-on-surface-variant uppercase tracking-widest">{t("footerRegion")}</span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="text-xs text-lab-outline">{t("footerPrivacy")}</span>
          <span className="text-xs text-lab-outline">{t("footerSocials")}</span>
        </div>
      </div>
    </footer>
  );
}
