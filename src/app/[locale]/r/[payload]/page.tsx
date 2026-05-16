import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { decodeSharedResult } from "@/lib/share-payload";
import { cn } from "@/lib/utils";

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
  const pct = data.p * 100;
  const pctLabel = pct >= 0.01 ? `${pct.toFixed(2)}%` : `${pct.toExponential(1)}%`;
  const tier = t(`tier_${data.tier}` as const);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      <Card className="border-white/60 bg-white/85 p-8 text-center shadow-2xl backdrop-blur-md">
        <p className="text-sm font-semibold text-muted-foreground">delulu.dating</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{tier}</h1>
        <p
          className="mt-4 text-6xl font-black tracking-tighter text-primary"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          {pctLabel}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("estimatedPool", { count: data.n })}
        </p>
      </Card>

      <Link
        href="/quiz"
        className={cn(buttonVariants({ variant: "default" }), "h-12 rounded-2xl font-bold")}
      >
        {t("again")}
      </Link>
    </main>
  );
}
