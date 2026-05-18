"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingFooter() {
  const t = useTranslations("landing");

  return (
    <footer className="relative overflow-hidden border-t-2 border-lab-on-surface bg-lab-surface-container-lowest px-4 py-14 md:px-16 md:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-lab-outline-variant" />
      <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-[#30c7ff]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-[#ff8add]/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <p className="font-lab-display text-lab-on-surface text-2xl font-extrabold tracking-tight uppercase">
            {t("footerBrand")}
          </p>
          <p className="font-lab-body text-lab-on-surface-variant mt-3 max-w-md text-sm leading-relaxed">{t("footerLegal")}</p>
          <p className="font-lab-mono text-lab-on-surface-variant mt-4 text-[10px] uppercase tracking-[0.2em]">{t("footerTag")}</p>
        </div>

        <div className="flex flex-col gap-3 md:col-span-3">
          <p className="font-lab-mono text-lab-on-surface-variant text-[10px] font-bold tracking-widest uppercase">{t("footerColExplore")}</p>
          <Link href="/quiz" className="puffy-btn puffy-btn-sm puffy-btn-soft w-fit">
            {t("footerLinkQuiz")}
          </Link>
          <Link href="/methodology" className="puffy-btn puffy-btn-sm puffy-btn-soft w-fit">
            {t("footerMethodology")}
          </Link>
          <Link href="/#specimens" className="puffy-btn puffy-btn-sm puffy-btn-soft w-fit">
            {t("footerLinkArchive")}
          </Link>
        </div>

        <div className="flex flex-col gap-3 md:col-span-4">
          <p className="font-lab-mono text-lab-on-surface-variant text-[10px] font-bold tracking-widest uppercase">{t("footerColMeta")}</p>
          <p className="font-lab-body text-lab-on-surface-variant text-sm">{t("footerBlurb")}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-full border-2 border-lab-on-surface bg-lab-secondary/30 px-3 py-1 text-[10px] font-semibold text-lab-on-surface">
              {t("footerChipSatire")}
            </span>
            <span className="rounded-full border-2 border-lab-on-surface bg-lab-primary/25 px-3 py-1 text-[10px] font-semibold text-lab-on-surface">
              {t("footerChipHK")}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-lab-outline-variant pt-8 text-center md:flex-row md:text-left">
        <span className="font-lab-mono text-lab-on-surface-variant text-[10px] uppercase tracking-widest">{t("footerRegion")}</span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="font-lab-body text-lab-on-surface-variant text-xs">{t("footerPrivacy")}</span>
          <span className="font-lab-body text-lab-on-surface-variant text-xs">{t("footerSocials")}</span>
        </div>
      </div>
    </footer>
  );
}
