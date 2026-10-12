import type { Lang } from "@/lib/format";

export type { Lang };
export const sprachen: Lang[] = ["de", "en", "fr"];
export const STANDARDSPRACHE: Lang = "de";

export function istSprache(x: string): x is Lang {
  return (sprachen as string[]).includes(x);
}

/** Interner Pfad mit Sprachpräfix: pfad("en", "/rechner") → "/en/rechner". */
export function pfad(lang: Lang, p: string): string {
  if (!p.startsWith("/")) return p;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
}

/** Derselbe Pfad in einer anderen Sprache. */
export function wechslePfad(aktuell: string, ziel: Lang): string {
  const rest = aktuell.replace(/^\/(de|en|fr)(?=\/|$)/, "");
  return `/${ziel}${rest}`;
}

/** hreflang-Alternativen für Metadaten. */
export function alternativen(lang: Lang, p: string) {
  return {
    canonical: pfad(lang, p),
    languages: { de: pfad("de", p), en: pfad("en", p), fr: pfad("fr", p), "x-default": pfad("de", p) },
  };
}

export type LangParams = { params: Promise<{ lang: string }> };

/** Name jeder Sprache in der Sprache selbst (für den Umschalter). */
export const sprachName: Record<Lang, string> = { de: "Deutsch", en: "English", fr: "Français" };

/** Sprache aus einem Pfad wie "/fr/rechner"; ohne Treffer die Standardsprache. */
export function spracheAusPfad(p: string): Lang {
  const erster = p.split("/")[1] ?? "";
  return istSprache(erster) ? erster : STANDARDSPRACHE;
}

export function statischeSprachen() {
  return sprachen.map((lang) => ({ lang }));
}
