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
    <main className="page-shell flex flex-1 flex-col gap-8 py-12 sm:gap-10 sm:py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">{t("title")}</h1>
      <p className="text-lg text-muted-foreground">{t("intro")}</p>

      <Card className="overflow-visible rounded-3xl border-white/55 bg-white/82 p-6 leading-relaxed shadow-lg backdrop-blur sm:p-8">
        <ul className="list-disc space-y-3 pl-5 text-sm">
          <li>{t("b1")}</li>
          <li>{t("b2")}</li>
          <li>{t("b3")}</li>
          <li>{t("b4")}</li>
          <li>{t("b5")}</li>
          <li>{t("b6")}</li>
          <li>{t("b7")}</li>
        </ul>
        <p className="mt-6 text-sm font-semibold text-primary">{t("outro")}</p>
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
