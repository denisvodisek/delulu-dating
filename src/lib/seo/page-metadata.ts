import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { IndexablePath } from "@/lib/seo/site";

type MetaKey = "title" | "quizTitle" | "methodologyTitle" | "crowdTitle";
type DescKey = "description" | "quizDescription" | "methodologyDescription" | "crowdDescription";

const PAGE_META: Record<
  IndexablePath,
  { path: IndexablePath | ""; titleKey: MetaKey; descKey: DescKey }
> = {
  "": { path: "", titleKey: "title", descKey: "description" },
  quiz: { path: "quiz", titleKey: "quizTitle", descKey: "quizDescription" },
  methodology: {
    path: "methodology",
    titleKey: "methodologyTitle",
    descKey: "methodologyDescription",
  },
  crowd: { path: "crowd", titleKey: "crowdTitle", descKey: "crowdDescription" },
};

export async function metadataForLocalePage(
  locale: string,
  page: IndexablePath,
): Promise<Metadata> {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  const keys = PAGE_META[page];
  return buildPageMetadata({
    locale,
    path: keys.path,
    title: t(keys.titleKey),
    description: t(keys.descKey),
  });
}
