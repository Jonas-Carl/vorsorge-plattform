/**
 * Zentrale, versionierte Förderparameter.
 *
 * Alle gesetzlichen Zahlen der Website stammen aus DIESER Datei. Komponenten und
 * Texte dürfen Förderwerte nicht selbst hartcodieren. Ändert sich das Recht, wird
 * ein neues Regelwerk ergänzt (nicht ein bestehendes überschrieben), damit die
 * Gültigkeit nachvollziehbar bleibt.
 */

export type RegelwerkStatus =
  /** Geltendes, bereits anwendbares Recht. */
  | "geltend"
  /** Verkündet, aber erst ab einem künftigen Stichtag anwendbar. */
  | "verkuendet-noch-nicht-wirksam";

type RegelwerkBasis = {
  id: string;
  bezeichnung: string;
  status: RegelwerkStatus;
  /** Erstes Beitragsjahr, für das das Regelwerk gilt. */
  gueltigAbBeitragsjahr: number;
  /** Letztes Beitragsjahr (falls befristet). */
  gueltigBisBeitragsjahr?: number;
  /** ISO-Datum der letzten redaktionellen Prüfung gegen die Primärquelle. */
  geprueftAm: string;
  /** IDs aus config/quellen.ts */
  quellen: string[];
  hinweise: string[];
};

/** Bisherige Riester-Förderung (nur zur Einordnung, wird nicht individuell berechnet). */
export type RiesterRegelwerk = RegelwerkBasis & {
  art: "riester";
  grundzulage: number;
  kinderzulageGeburtVor2008: number;
  kinderzulageGeburtAb2008: number;
  mindesteigenbeitragAnteilVorjahreseinkommen: number;
  sockelbetrag: number;
  hoechstbetragSonderausgaben: number;
  berufseinsteigerbonus: number;
};

/** Beitragsproportionale Förderung nach dem Altersvorsorgereformgesetz. */
export type ReformRegelwerk = RegelwerkBasis & {
  art: "beitragsproportional";
  grundzulage: {
    /** Stufe 1: Fördersatz auf Beiträge bis `bis` Euro im Jahr. */
    stufe1: { bis: number; satz: number };
    /** Stufe 2: Fördersatz auf Beiträge oberhalb Stufe 1 bis `bis` Euro im Jahr. */
    stufe2: { bis: number; satz: number };
  };
  kinderzulage: { satz: number; hoechstbetragJeKind: number };
  berufseinsteigerbonus: { betrag: number; vorVollendungLebensjahr: number };
  mindesteigenbeitrag: number;
  /** Grundzulage für mittelbar berechtigte Ehegatten (§ 79 Satz 2 EStG) höchstens. */
  grundzulageMittelbarHoechstens: number;
  sonderausgabenHoechstbetrag: number;
  /** Jährliche Einzahlungsgrenze je Vertrag (AltZertG). */
  einzahlungsgrenzeJahr: number;
  produkt: {
    effektivkostenStandarddepotMax: number;
    garantiestufen: number[];
    auszahlungFruehestensAlter: number;
    auszahlungSpaetestensAlter: number;
    auszahlungsplanEndetFruehestensAlter: number;
    teilauszahlungMaxAnteil: number;
    wechselkostenMax: number;
    wechselkostenFristJahre: number;
  };
};

export type Regelwerk = RiesterRegelwerk | ReformRegelwerk;

export const riester2026: RiesterRegelwerk = {
  id: "riester-bis-2026",
  art: "riester",
  bezeichnung: "Riester-Förderung (EStG in der bis 31.12.2026 geltenden Fassung)",
  status: "geltend",
  gueltigAbBeitragsjahr: 2018,
  gueltigBisBeitragsjahr: 2026,
  geprueftAm: "2026-10-11",
  quellen: ["estg-geltend", "zfa-faq"],
  grundzulage: 175,
  kinderzulageGeburtVor2008: 185,
  kinderzulageGeburtAb2008: 300,
  mindesteigenbeitragAnteilVorjahreseinkommen: 0.04,
  sockelbetrag: 60,
  hoechstbetragSonderausgaben: 2100,
  berufseinsteigerbonus: 200,
  hinweise: [
    "Die volle Zulage setzt einen einkommensabhängigen Mindesteigenbeitrag voraus. Ohne Einkommensangaben ist keine individuelle Berechnung möglich – die Plattform berechnet dieses Regelwerk deshalb nicht.",
    "Ab 2027 können keine neuen Verträge nach dem alten Modell mehr abgeschlossen werden; bestehende Verträge können fortgeführt werden.",
  ],
};

export const reform2027: ReformRegelwerk = {
  id: "avrg-ab-2027",
  art: "beitragsproportional",
  bezeichnung: "Altersvorsorgereformgesetz (BGBl. 2026 I Nr. 156), Förderung ab Beitragsjahr 2027",
  status: "verkuendet-noch-nicht-wirksam",
  gueltigAbBeitragsjahr: 2027,
  geprueftAm: "2026-10-11",
  quellen: ["bgbl-2026-156", "bundestag-kw13-2026", "bundesregierung-faq"],
  grundzulage: {
    stufe1: { bis: 360, satz: 0.5 },
    stufe2: { bis: 1800, satz: 0.25 },
  },
  kinderzulage: { satz: 1, hoechstbetragJeKind: 300 },
  berufseinsteigerbonus: { betrag: 200, vorVollendungLebensjahr: 25 },
  mindesteigenbeitrag: 120,
  grundzulageMittelbarHoechstens: 175,
  sonderausgabenHoechstbetrag: 1800,
  einzahlungsgrenzeJahr: 6840,
  produkt: {
    effektivkostenStandarddepotMax: 0.01,
    garantiestufen: [0.8, 1],
    auszahlungFruehestensAlter: 65,
    auszahlungSpaetestensAlter: 70,
    auszahlungsplanEndetFruehestensAlter: 85,
    teilauszahlungMaxAnteil: 0.3,
    wechselkostenMax: 150,
    wechselkostenFristJahre: 5,
  },
  hinweise: [
    "Das Gesetz ist verkündet, die Förderregeln gelten aber erst ab dem Beitragsjahr 2027. Bis dahin ist eine Förderung nach diesen Regeln nicht möglich.",
    "Ob und in welcher Höhe eine Zulage tatsächlich gewährt wird, entscheidet die Zentrale Zulagenstelle für Altersvermögen anhand der persönlichen Voraussetzungen.",
    "Der zusätzliche Sonderausgabenabzug (Günstigerprüfung durch das Finanzamt) hängt vom persönlichen Steuersatz ab und wird hier nicht berechnet.",
    "Ein Standarddepot in öffentlicher Trägerschaft kann per Rechtsverordnung eingeführt werden; Zeitpunkt und Ausgestaltung sind offen.",
  ],
};

export const regelwerke: Regelwerk[] = [riester2026, reform2027];

/** Regelwerk, das für ein Beitragsjahr maßgeblich ist. */
export function regelwerkFuerBeitragsjahr(jahr: number): Regelwerk {
  return jahr >= reform2027.gueltigAbBeitragsjahr ? reform2027 : riester2026;
}

/** Aus dem Regelwerk abgeleitete Kennzahlen (nicht separat pflegen). */
export function maxGrundzulage(r: ReformRegelwerk = reform2027): number {
  const { stufe1, stufe2 } = r.grundzulage;
  return stufe1.bis * stufe1.satz + (stufe2.bis - stufe1.bis) * stufe2.satz;
}
