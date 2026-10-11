/**
 * Datenmodell für Kontaktanfragen (Leads).
 *
 * Grundsatz Datenminimierung: Es werden nur Angaben gespeichert, die für die
 * Bearbeitung der konkreten Anfrage nötig sind. Keine Einkommens-, Gesundheits-
 * oder Rechnerdaten, keine IP-Adresse, kein User-Agent.
 */

export type LeadStatus =
  | "eingegangen"
  | "validiert"
  | "zur_uebermittlung_bereit"
  | "erfolgreich_uebermittelt"
  | "uebermittlung_fehlgeschlagen"
  | "in_bearbeitung"
  | "abgeschlossen"
  | "geloescht";

export type Uebermittlungsstatus =
  /** Empfänger ist die Plattform selbst – es findet keine Weitergabe statt. */
  | "nicht_vorgesehen"
  /** Partner gewählt, aber technische Anbindung fehlt oder ist nicht konfiguriert. */
  | "ausstehend"
  | "erfolgreich"
  | "fehlgeschlagen";

export type Kontaktweg = "email" | "telefon";
export type Kontaktzeit = "egal" | "vormittags" | "nachmittags" | "abends";
export type Anliegen = "allgemein" | "reform-2027" | "foerderung" | "bestehender-vertrag" | "familie";

/** Nachweis einer Einwilligung bzw. Bestätigung: wer, wann, wozu, mit welchem Wortlaut. */
export type Einwilligungsnachweis = {
  zweck: "kontaktaufnahme_und_weitergabe";
  /** Version des angezeigten Textes (siehe EINWILLIGUNGSTEXT_VERSION). */
  textVersion: string;
  /** Exakt angezeigter Wortlaut inkl. Empfängername. */
  wortlaut: string;
  erteiltAm: string;
  empfaenger: string;
};

/** Kampagnenzuordnung – nur grobe, nicht personenbezogene Kampagnenparameter. */
export type Attribution = {
  quelle?: string;
  medium?: string;
  kampagne?: string;
  /** Pfad der Einstiegsseite ohne Query-String. */
  einstieg?: string;
};

/**
 * Stufen der wirtschaftlichen Auswertung. Jede Stufe wird nur gesetzt, wenn sie
 * tatsächlich belegt ist – eine abgeschickte Anfrage ist NICHT automatisch ein
 * qualifizierter Lead, eine Übergabe kein Vertragsabschluss.
 */
export type Wertschoepfung = {
  /** Gesetzt nach dokumentierter Prüfung (Definition: siehe docs/BETRIEB-UND-RECHT.md). */
  qualifiziertAm?: string;
  uebergebenAm?: string;
  vermitteltAm?: string;
  vertragBestaetigtAm?: string;
  verguetungAbgerechnetAm?: string;
};

export type Lead = {
  id: string;
  erstelltAm: string;
  aktualisiertAm: string;
  /** Partner-ID oder "plattform". */
  empfaengerId: string;
  kontakt: {
    vorname: string;
    nachname: string;
    email: string;
    telefon?: string;
    kontaktweg: Kontaktweg;
    kontaktzeit: Kontaktzeit;
  };
  anliegen: Anliegen;
  nachricht?: string;
  status: LeadStatus;
  uebermittlung: {
    status: Uebermittlungsstatus;
    versuche: number;
    letzterVersuchAm?: string;
    /** Technischer Fehlercode – niemals personenbezogene Inhalte. */
    fehler?: string;
  };
  einwilligungen: Einwilligungsnachweis[];
  attribution: Attribution;
  wertschoepfung: Wertschoepfung;
  /** Sprache, in der die Anfrage gestellt wurde (für die Antwort). */
  sprache: "de" | "en";
  /** Vom Client erzeugter Schlüssel zum Schutz vor Doppelübermittlung. */
  idempotenzSchluessel: string;
  /** Spätestes Löschdatum nach Löschkonzept (ISO). */
  loeschenBis: string;
};

/** Rohdaten, wie sie das Formular an die API sendet. */
export type LeadAnfrage = {
  vorname?: unknown;
  nachname?: unknown;
  email?: unknown;
  telefon?: unknown;
  kontaktweg?: unknown;
  kontaktzeit?: unknown;
  anliegen?: unknown;
  nachricht?: unknown;
  empfaengerId?: unknown;
  einwilligung?: unknown;
  idempotenzSchluessel?: unknown;
  attribution?: unknown;
  /** Sprache der Oberfläche ("de" | "en") – bestimmt Meldungen und Bestätigungswortlaut. */
  sprache?: unknown;
  /** Honeypot – muss leer bleiben. */
  website?: unknown;
  /** Millisekunden zwischen Formularanzeige und Absenden. */
  ausfuelldauerMs?: unknown;
};

export type Feldfehler = Partial<Record<
  "vorname" | "nachname" | "email" | "telefon" | "kontaktweg" | "kontaktzeit" | "anliegen" | "nachricht" | "empfaengerId" | "einwilligung",
  string
>>;

export type LeadAntwort =
  | {
      ok: true;
      leadId: string;
      /** Ehrlicher Stand der Weitergabe – steuert die Erfolgsmeldung. */
      uebermittlung: Uebermittlungsstatus;
      empfaengerName: string;
      duplikat: boolean;
    }
  | { ok: false; code: "validierung"; fehler: Feldfehler }
  | { ok: false; code: "speicher_nicht_verfuegbar" | "zu_viele_anfragen" | "ungueltige_anfrage" | "serverfehler"; meldung: string };
