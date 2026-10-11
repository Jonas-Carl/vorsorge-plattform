import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { artikelSlugs, landingpageSlugs } from "@/content";
import { sprachen } from "@/i18n";

const seiten: [string, number][] = [
  ["", 1],
  ["/rechner", 0.9],
  ["/reform-2027", 0.9],
  ["/wissen", 0.8],
  ...artikelSlugs.map((s): [string, number] => [`/wissen/${s}`, 0.7]),
  ...landingpageSlugs.map((s): [string, number] => [`/themen/${s}`, 0.6]),
  ["/partner", 0.5],
  ["/anfrage", 0.5],
  ["/quellen-methodik", 0.5],
  ["/transparenz", 0.4],
  ["/ueber-uns", 0.4],
  ["/kontakt", 0.3],
  ["/datenschutz", 0.2],
  ["/cookie-einstellungen", 0.1],
];

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return seiten.flatMap(([p, priority]) =>
    sprachen.map((lang) => ({
      url: `${site.url}/${lang}${p}`,
      lastModified: site.inhaltsstand,
      priority,
      alternates: { languages: Object.fromEntries(sprachen.map((s) => [s, `${site.url}/${s}${p}`])) },
    })),
  );
}
