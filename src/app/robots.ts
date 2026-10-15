import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Nicht indexieren, solange Betreiberangaben fehlen – und nie die Vorschau auf GitHub Pages,
  // damit Google sie nicht als Doppel der echten Seite (rentekannmehr.de) findet.
  if (!site.betreiberdatenVollstaendig || process.env.NEXT_PUBLIC_DEMO === "1") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
