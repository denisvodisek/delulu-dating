import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("methodology");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">{t("title")}</h1>
      <p className="text-lg text-muted-foreground">{t("intro")}</p>

      <Card className="border-white/60 bg-white/80 p-6 leading-relaxed shadow-lg backdrop-blur">
        <ul className="list-disc space-y-3 pl-5 text-sm">
          <li>
            <strong>Model:</strong> independent filters multiplied (joint probability under
            independence). Mild +12% correlation uplift so tall + rich stacks aren&apos;t
            astronomically harsher than reality.
          </li>
          <li>
            <strong>Height:</strong> HK Population Health Survey (2014/15) male mean 169.5 cm;
            SD approximated at 5.8 cm from local anthropometric references.
          </li>
          <li>
            <strong>Income:</strong> Census and Statistics Department Annual Earnings and Hours
            Survey — male wage percentile curve (HK$), interpolated between published points.
          </li>
          <li>
            <strong>Age / marital / education:</strong> 2021 Census &amp; thematic reports
            (simplified age-window and never-married proxies).
          </li>
          <li>
            <strong>Districts:</strong> 2021 Census district weights blended into male share
            priors — illustrative, not block-level GPS accuracy.
          </li>
          <li>
            <strong>Smoking / kids:</strong> broad CHP / survey priors — rounded, not bespoke
            matchmaking intel.
          </li>
        </ul>
        <p className="mt-6 text-sm font-semibold text-primary">
          This is spicy satire + public statistics. If you&apos;re offended, the numbers
          still love you. Probably.
        </p>
      </Card>

      <Link
        href="/"
        className={cn(buttonVariants({ variant: "default" }), "w-fit rounded-2xl font-bold")}
      >
        {t("back")}
      </Link>
    </main>
  );
}
