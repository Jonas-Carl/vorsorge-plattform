import type { Lang } from "@/lib/format";

export type { Lang };
export const sprachen: Lang[] = ["de", "en"];
export const STANDARDSPRACHE: Lang = "de";

export function istSprache(x: string): x is Lang {
  return x === "de" || x === "en";
}

/** Interner Pfad mit Sprachpräfix: pfad("en", "/rechner") → "/en/rechner". */
export function pfad(lang: Lang, p: string): string {
  if (!p.startsWith("/")) return p;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
}

/** Derselbe Pfad in der anderen Sprache. */
export function wechslePfad(aktuell: string, ziel: Lang): string {
  const rest = aktuell.replace(/^\/(de|en)(?=\/|$)/, "");
  return `/${ziel}${rest}`;
}

/** hreflang-Alternativen für Metadaten. */
export function alternativen(lang: Lang, p: string) {
  return {
    canonical: pfad(lang, p),
    languages: { de: pfad("de", p), en: pfad("en", p), "x-default": pfad("de", p) },
  };
}

export type LangParams = { params: Promise<{ lang: string }> };

export function statischeSprachen() {
  return sprachen.map((lang) => ({ lang }));
}
