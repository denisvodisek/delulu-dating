import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("methodology");

  return (
    <main className="page-shell flex flex-1 flex-col gap-8 pt-24 pb-12 sm:gap-10 sm:pb-16">
      <h1 className="font-lab-display text-4xl font-extrabold tracking-tight text-lab-on-surface">{t("title")}</h1>
      <p className="font-lab-body text-lg text-lab-on-surface-variant">{t("intro")}</p>

      <Card className="overflow-visible rounded-3xl border-2 border-lab-on-surface/10 bg-white/82 p-6 leading-relaxed shadow-lg backdrop-blur sm:p-8">
        <ul className="font-lab-body list-disc space-y-3 pl-5 text-sm text-lab-on-surface">
          <li>{t("b1")}</li>
          <li>{t("b2")}</li>
          <li>{t("b3")}</li>
          <li>{t("b4")}</li>
          <li>{t("b5")}</li>
          <li>{t("b6")}</li>
          <li>{t("b7")}</li>
          <li>{t("b8")}</li>
        </ul>
        <p className="font-lab-body mt-6 text-sm font-semibold text-lab-on-surface">{t("outro")}</p>
      </Card>

      <Link href="/" className="puffy-btn puffy-btn-lg puffy-btn-soft w-fit">
        {t("back")}
      </Link>
    </main>
  );
}
