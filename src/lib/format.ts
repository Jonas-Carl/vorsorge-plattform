export type Lang = "de" | "en" | "fr";

const LOCALE: Record<Lang, string> = { de: "de-DE", en: "en-GB", fr: "fr-FR" };

/** BCP-47-Kennung für Intl-Formatierung, z. B. "fr" → "fr-FR". */
export const loc = (lang: Lang) => LOCALE[lang];

/** Euro ohne Nachkommastellen, z. B. „12.345 €“ (de) bzw. „€12,345“ (en). */
export function euro(x: number, lang: Lang = "de"): string {
  const r = Math.round(x);
  return new Intl.NumberFormat(loc(lang), { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(r === 0 ? 0 : r);
}

export function euroGenau(x: number, lang: Lang = "de"): string {
  return new Intl.NumberFormat(loc(lang), { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(x);
}

export function ganzzahl(x: number, lang: Lang = "de"): string {
  return new Intl.NumberFormat(loc(lang), { maximumFractionDigits: 0 }).format(Math.round(x));
}

/** Anteil als Prozent, z. B. 0.0125 → „1,25 %“ (de) bzw. „1.25%“ (en). */
export function prozent(anteil: number, maxStellen = 2, lang: Lang = "de"): string {
  return new Intl.NumberFormat(loc(lang), { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: maxStellen }).format(anteil);
}

/** Kompakte Achsenbeschriftung, z. B. 150000 → „150 Tsd. €“ / „€150k“ / „150 k€“. */
export function euroKompakt(x: number, lang: Lang = "de"): string {
  const z = (v: number, s = 0) => new Intl.NumberFormat(loc(lang), { maximumFractionDigits: s }).format(v);
  if (lang === "en") {
    if (Math.abs(x) >= 1_000_000) return `€${z(x / 1_000_000, 1)}m`;
    if (Math.abs(x) >= 1000) return `€${z(x / 1000)}k`;
    return `€${z(x)}`;
  }
  if (lang === "fr") {
    if (Math.abs(x) >= 1_000_000) return `${z(x / 1_000_000, 1)} M€`;
    if (Math.abs(x) >= 1000) return `${z(x / 1000)} k€`;
    return `${z(x)} €`;
  }
  if (Math.abs(x) >= 1_000_000) return `${z(x / 1_000_000, 1)} Mio. €`;
  if (Math.abs(x) >= 1000) return `${z(x / 1000)} Tsd. €`;
  return `${z(x)} €`;
}

export function datum(iso: string, lang: Lang = "de"): string {
  const [j, m, t] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(loc(lang), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(j ?? 2026, (m ?? 1) - 1, t ?? 1)),
  );
}
