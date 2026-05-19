import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { decodeSharedResult } from "@/lib/share-payload";
import { cn } from "@/lib/utils";
import { formatMatchPercent } from "@/lib/format-match";
import { MAX_ONE_IN_DISPLAY } from "@/lib/format-one-in";
import { oneInN } from "@/lib/calc/probability";

export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ locale: string; payload: string }>;
}) {
  const { locale, payload } = await params;
  setRequestLocale(locale);

  const data = decodeSharedResult(payload);
  if (!data) notFound();

  const t = await getTranslations("result");
  const pctLabel = formatMatchPercent(data.p);
  const tier = t(`tier_${data.tier}` as const);
  const n = oneInN(data.p);
  const oddsPastUiCeil =
    Number.isFinite(data.p) &&
    data.p > 0 &&
    Number.isFinite(1 / data.p) &&
    1 / data.p > MAX_ONE_IN_DISPLAY;

  return (
    <main className="page-shell flex flex-1 flex-col gap-7 pt-24 pb-10 sm:pb-12">
      <Card className="overflow-visible rounded-3xl border-white/55 bg-white/88 p-7 text-center shadow-[0_24px_55px_-28px_rgba(90,60,140,0.45)] backdrop-blur-md sm:p-10">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">delulu.dating</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{tier}</h1>
        <p className="font-lab-display mt-6 text-5xl font-black tracking-tight text-primary sm:text-6xl">
          {oddsPastUiCeil ? t("oneInCapped", { n }) : t("oneIn", { n })}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("heroChanceLine_male", { pct: pctLabel })}
        </p>
        <p className="mx-auto mt-5 max-w-md text-pretty text-sm text-muted-foreground">
          {t("poolExplainer", { count: data.n })}
        </p>
      </Card>

      <Link
        href="/quiz"
        className={cn(
          buttonVariants({ variant: "default" }),
          "h-14 rounded-3xl text-base font-bold sm:h-16",
        )}
      >
        {t("again")}
      </Link>
    </main>
  );
}
