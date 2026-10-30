/**
 * Angaben zur Beratungsanfrage. Das Formular fragt nur Anliegen und Beruf ab; die übrigen
 * Felder bleiben optional (z. B. für den Server-Betrieb oder eine spätere Erweiterung).
 *
 * Bewusst nur Spannen statt genauer Beträge und nichts zu Gesundheit oder Kontodaten.
 */

export const ZIELE = ["starten", "pruefen", "foerderung", "kennenlernen", "sonstiges"] as const;
export const BERUFE = ["angestellt", "selbststaendig", "beamt", "ausbildung", "sonstiges"] as const;
export const SPARBETRAEGE = ["bis50", "50bis150", "150bis300", "ueber300", "unklar"] as const;
export const VORSORGE = ["riester", "betriebsrente", "depot", "versicherung", "nichts"] as const;
export const STARTS = ["sofort", "dreiMonate", "informieren"] as const;
export const EINKOMMEN = ["unter30", "30bis50", "50bis80", "ueber80", "keineAngabe"] as const;
export const KINDER = ["0", "1", "2", "3plus"] as const;

export type Ziel = (typeof ZIELE)[number];
export type Beruf = (typeof BERUFE)[number];
export type Sparbetrag = (typeof SPARBETRAEGE)[number];
export type Vorsorge = (typeof VORSORGE)[number];
export type Start = (typeof STARTS)[number];
export type Einkommen = (typeof EINKOMMEN)[number];
export type Kinder = (typeof KINDER)[number];

export type Qualifikation = {
  ziel?: Ziel;
  alter?: number;
  beruf?: Beruf;
  sparbetrag?: Sparbetrag;
  /** Mehrfachauswahl. */
  vorsorge: Vorsorge[];
  start?: Start;
  /** Freiwillig. */
  einkommen?: Einkommen;
  kinder?: Kinder;
};

export const LEERE_QUALIFIKATION: Qualifikation = { vorsorge: [] };

export type QualiFehler = Partial<Record<"ziel" | "beruf", true>>;

const aus = <T extends string>(liste: readonly T[], v: unknown): T | undefined =>
  liste.find((x) => x === v);

/** Bereinigt die Angaben und meldet fehlende Pflichtangaben (Anliegen und Beruf). */
export function pruefeQualifikation(roh: unknown): { daten: Qualifikation; fehler: QualiFehler } {
  const r = (roh && typeof roh === "object" ? roh : {}) as Record<string, unknown>;
  const alterZahl = Number(r.alter);
  const alter = Number.isFinite(alterZahl) && alterZahl >= 15 && alterZahl <= 99 ? Math.round(alterZahl) : undefined;
  const daten: Qualifikation = {
    ziel: aus(ZIELE, r.ziel),
    alter,
    beruf: aus(BERUFE, r.beruf),
    sparbetrag: aus(SPARBETRAEGE, r.sparbetrag),
    vorsorge: Array.isArray(r.vorsorge)
      ? [...new Set(r.vorsorge.map((v) => aus(VORSORGE, v)).filter((v): v is Vorsorge => Boolean(v)))]
      : [],
    start: aus(STARTS, r.start),
    einkommen: aus(EINKOMMEN, r.einkommen),
    kinder: aus(KINDER, r.kinder),
  };
  // „Noch nichts“ schließt die anderen Antworten aus.
  if (daten.vorsorge.includes("nichts")) daten.vorsorge = ["nichts"];
  const fehler: QualiFehler = {};
  if (!daten.ziel) fehler.ziel = true;
  if (!daten.beruf) fehler.beruf = true;
  return { daten, fehler };
}

/** Monatsbetrag aus dem Rechner in eine Spanne übersetzen. */
export function sparbetragAusRate(rate: number): Sparbetrag {
  if (rate <= 50) return "bis50";
  if (rate <= 150) return "50bis150";
  if (rate <= 300) return "150bis300";
  return "ueber300";
}

export function kinderAusAnzahl(n: number): Kinder {
  return n <= 0 ? "0" : n === 1 ? "1" : n === 2 ? "2" : "3plus";
}

/**
 * Übergabe Rechner → Formular. Liegt nur im Browser (sessionStorage) und wird erst mit dem
 * Absenden des Formulars übertragen – und nur, wenn die Person es dort stehen lässt.
 */
export const RECHNER_UEBERGABE = "rkm-rechner";
export type RechnerUebergabe = {
  alter: number;
  sparrate: number;
  kinder: number;
  rentenalter: number;
  /** Zuschuss vom Staat im ersten Jahr (Euro). */
  zuschussJahr: number;
  /** Voraussichtliches Kapital bei Rentenbeginn im mittleren Szenario der Person (Euro). */
  endkapital: number;
};

/** Rechner-Werte prüfen, bevor sie mitgeschickt werden (nur plausible Zahlen). */
export function pruefeRechner(roh: unknown): RechnerUebergabe | undefined {
  if (!roh || typeof roh !== "object") return undefined;
  const r = roh as Record<string, unknown>;
  const zahl = (v: unknown, min: number, max: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : undefined;
  };
  const w = {
    alter: zahl(r.alter, 15, 99),
    sparrate: zahl(r.sparrate, 0, 10_000),
    kinder: zahl(r.kinder, 0, 10),
    rentenalter: zahl(r.rentenalter, 55, 75),
    zuschussJahr: zahl(r.zuschussJahr, 0, 10_000),
    endkapital: zahl(r.endkapital, 0, 50_000_000),
  };
  return Object.values(w).every((v) => v !== undefined) ? (w as RechnerUebergabe) : undefined;
}
