import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const t = useTranslations("nav");
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/55 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-base font-extrabold tracking-tight text-primary",
          )}
        >
          {t("brand")}
        </Link>
        <Link
          href="/methodology"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-semibold")}
        >
          {t("howShort")}
        </Link>
      </div>
    </header>
  );
}
