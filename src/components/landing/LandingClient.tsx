"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Sparkle } from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function LandingClient() {
  const t = useTranslations("landing");
  const tMeta = useTranslations("meta");
  const [runs, setRuns] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: { runsToday?: number }) => {
        if (!cancelled && typeof d.runsToday === "number") setRuns(d.runsToday);
      })
      .catch(() => {
        if (!cancelled) setRuns(8840);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-5 py-14">
      <div className="flex flex-col items-center gap-3 text-center">
        <Badge className="rounded-full bg-white/70 px-4 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          <Sparkle className="mr-1 inline" weight="duotone" size={16} />
          {t("badge")}
        </Badge>
        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {t("headline")}
        </h1>
        <p className="text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t("sub")}
        </p>
        {runs != null && (
          <p className="text-sm font-medium text-primary/80">
            {t("runsToday", { count: runs })}
          </p>
        )}
      </div>

      <Card className="border-white/60 bg-white/75 p-6 shadow-xl shadow-primary/10 backdrop-blur-md">
        <div className="flex flex-col gap-4">
          <Link
            href="/quiz"
            className={cn(
              buttonVariants({ variant: "default" }),
              "flex h-14 w-full items-center justify-center rounded-2xl text-lg font-bold shadow-lg shadow-primary/25",
            )}
          >
            <Heart className="mr-2" weight="fill" size={22} />
            {t("cta")}
          </Link>

          <div className="rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/30 p-4 text-center text-xs text-muted-foreground">
            <p className="mb-2 font-semibold text-foreground/70">{t("findGirlfriend")}</p>
            <span className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
              {t("comingSoon")}
            </span>
          </div>
        </div>
      </Card>

      <p className="text-center text-xs text-muted-foreground">{t("disclaimer")}</p>
      <p className="sr-only">{tMeta("description")}</p>
    </main>
  );
}
