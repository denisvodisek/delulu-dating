import { getTranslations } from "next-intl/server";

export async function MonetizationSlot() {
  const enabled = process.env.NEXT_PUBLIC_MONETIZATION === "on";
  if (!enabled) return null;
  const t = await getTranslations("result");
  return (
    <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 to-secondary/30 p-6 text-center text-sm text-muted-foreground">
      {t("monetizationOn")}
    </div>
  );
}
