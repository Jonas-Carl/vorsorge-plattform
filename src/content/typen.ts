import { maxGrundzulage, reform2027, riester2026 } from "@/config/foerderung";
import { euro as euroL, prozent as prozentL, type Lang } from "@/lib/format";

/**
 * Inhaltsmodell des Wissensbereichs.
 *
 * Text-Blöcke unterstützen zwei Inline-Auszeichnungen:
 *   **fett**   und   [Linktext](/interner-pfad)
 */
export type Block =
  | { t: "p"; x: string }
  | { t: "h2"; x: string }
  | { t: "h3"; x: string }
  | { t: "ul"; items: string[] }
  | { t: "hinweis"; titel?: string; x: string; art?: "gold" }
  | { t: "beispiel"; titel: string; x: string[] }
  | { t: "tabelle"; titel?: string; kopf: string[]; zeilen: string[][] };

export type Kategorie =
  | "Grundlagen"
  | "Reform 2027"
  | "Förderung"
  | "Geldanlage"
  | "Lebenssituationen"
  | "Rechner & Methodik";

export type Artikel = {
  slug: string;
  titel: string;
  /** Ein bis zwei Sätze in ganz einfacher Sprache (für ein 10-jähriges Kind verständlich). */
  einfach: string;
  /** Meta-Description und Teaser (max. ~160 Zeichen). */
  kurz: string;
  kategorie: Kategorie;
  lesezeitMin: number;
  /** ISO-Datum der letzten inhaltlichen Prüfung. */
  stand: string;
  /** IDs aus config/quellen.ts – leer bei reinen Grundlagenthemen ohne Rechtsbezug. */
  quellen: string[];
  bloecke: Block[];
  verwandt: string[];
};

export const STAND = "2026-10-11";

const r = reform2027;
const alt = riester2026;

/**
 * Formatierte Förderwerte für Texte. Artikel verwenden ausschließlich diese
 * Werte – so bleibt config/foerderung.ts die einzige Quelle für Zahlen.
 * `F` ist deutsch formatiert, `FE` englisch, `FF` französisch.
 */
export function makeF(lang: Lang) {
  const euro = (x: number) => euroL(x, lang);
  const prozent = (x: number) => prozentL(x, 2, lang);
  return {
    ab: String(r.gueltigAbBeitragsjahr),
    stufe1Satz: prozent(r.grundzulage.stufe1.satz),
    stufe1Bis: euro(r.grundzulage.stufe1.bis),
    stufe2Satz: prozent(r.grundzulage.stufe2.satz),
    stufe2Bis: euro(r.grundzulage.stufe2.bis),
    maxGrund: euro(maxGrundzulage()),
    grundStufe1Max: euro(r.grundzulage.stufe1.bis * r.grundzulage.stufe1.satz),
    kindMax: euro(r.kinderzulage.hoechstbetragJeKind),
    kindMaxMonat: euro(r.kinderzulage.hoechstbetragJeKind / 12),
    bonus: euro(r.berufseinsteigerbonus.betrag),
    bonusAlter: String(r.berufseinsteigerbonus.vorVollendungLebensjahr),
    mindest: euro(r.mindesteigenbeitrag),
    mindestMonat: euro(r.mindesteigenbeitrag / 12),
    mittelbarMax: euro(r.grundzulageMittelbarHoechstens),
    sonderausgaben: euro(r.sonderausgabenHoechstbetrag),
    einzahlungMax: euro(r.einzahlungsgrenzeJahr),
    einzahlungMaxMonat: euro(r.einzahlungsgrenzeJahr / 12),
    kostenMax: prozent(r.produkt.effektivkostenStandarddepotMax),
    garantieA: prozent(r.produkt.garantiestufen[0] ?? 0.8),
    garantieB: prozent(r.produkt.garantiestufen[1] ?? 1),
    auszahlungAb: String(r.produkt.auszahlungFruehestensAlter),
    auszahlungBis: String(r.produkt.auszahlungSpaetestensAlter),
    planBis: String(r.produkt.auszahlungsplanEndetFruehestensAlter),
    teilauszahlung: prozent(r.produkt.teilauszahlungMaxAnteil),
    wechselMax: euro(r.produkt.wechselkostenMax),
    wechselJahre: String(r.produkt.wechselkostenFristJahre),
    altGrund: euro(alt.grundzulage),
    altKindAlt: euro(alt.kinderzulageGeburtVor2008),
    altKindNeu: euro(alt.kinderzulageGeburtAb2008),
    altMindest: prozent(alt.mindesteigenbeitragAnteilVorjahreseinkommen),
    altSockel: euro(alt.sockelbetrag),
    altHoechst: euro(alt.hoechstbetragSonderausgaben),
  } as const;
}

export const F = makeF("de");
export const FE = makeF("en");
export const FF = makeF("fr");
