import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Keep SEO/metadata routes and static assets out of locale middleware.
  matcher: ["/((?!api|_next|_vercel|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|.*\\..*).*)"],
};
