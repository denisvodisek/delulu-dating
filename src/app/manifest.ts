import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Delulu Dating",
    short_name: "Delulu",
    description: "Hong Kong dating reality calculator — how delulu is your wishlist?",
    start_url: "/en",
    scope: "/",
    display: "standalone",
    background_color: "#eef9ff",
    theme_color: "#30c7ff",
    lang: "en",
    icons: [
      {
        src: "/brand-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    id: SITE_URL,
  };
}
