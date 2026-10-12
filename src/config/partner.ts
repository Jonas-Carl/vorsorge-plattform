/**
 * Zentrale Partnerverwaltung.
 *
 * Partner werden AUSSCHLIESSLICH hier gepflegt. Ein Partner erscheint erst dann
 * als auswählbarer Empfänger im Kontaktformular, wenn
 *   status === "aktiv"  UND  vereinbarung === "abgeschlossen".
 *
 * Aktuell existieren nur neutrale Platzhalter. Es gibt KEINE realen
 * Kooperationen; es dürfen keine echten Namen, Logos oder Bewertungen
 * eingetragen werden, bevor eine Vereinbarung tatsächlich besteht.
 */

export type Kontaktweg = "email" | "telefon";

export type PartnerIntegration =
  /** Keine technische Anbindung – Übergabe erfolgt (noch) nicht. */
  | { art: "keine" }
  /** Signierter HTTPS-Webhook; Ziel-URL kommt aus der Umgebungsvariable PARTNER_WEBHOOK_URL_<ID>. */
  | { art: "webhook" }
  /** Manuelle Übergabe durch berechtigte Mitarbeitende über ein internes Werkzeug (noch nicht gebaut). */
  | { art: "manuell" };

export type Verguetungsmodell =
  | "offen"
  | "je-qualifiziertem-lead"
  | "je-erfolgreicher-vermittlung"
  | "provision-bei-vertragsabschluss";

export type Partner = {
  id: string;
  name: string;
  /** Pfad zu einem Logo unter /public – null, solange keines freigegeben ist. */
  logo: string | null;
  beschreibung: string;
  leistungen: string[];
  zielgruppe: string;
  /** Ort bzw. Gebiet, in dem der Partner persönlich berät (z. B. "Osnabrück und Umgebung"). */
  region: string;
  kontakt: { url: string | null; email: string | null; telefon: string | null };
  status: "platzhalter" | "aktiv" | "inaktiv";
  vereinbarung: "keine" | "in-verhandlung" | "abgeschlossen" | "beendet";
  /** z. B. Erlaubnis nach § 34d / § 34f GewO, Registernummer, Aufsichtsbehörde. */
  regulatorik: string;
  transparenzhinweis: string;
  verguetung: Verguetungsmodell;
  zulaessigeKontaktwege: Kontaktweg[];
  integration: PartnerIntegration;
};

function platzhalter(nr: string): Partner {
  return {
    id: `partner-${nr}`,
    name: `[PARTNER_${nr}_NAME]`,
    logo: null,
    beschreibung: `[PARTNER_${nr}_BESCHREIBUNG]`,
    leistungen: [`[PARTNER_${nr}_LEISTUNGEN]`],
    zielgruppe: `[PARTNER_${nr}_ZIELGRUPPE]`,
    region: `[PARTNER_${nr}_REGION]`,
    kontakt: { url: null, email: null, telefon: null },
    status: "platzhalter",
    vereinbarung: "keine",
    regulatorik: `[PARTNER_${nr}_REGULATORISCHE_ANGABEN]`,
    transparenzhinweis: `[PARTNER_${nr}_TRANSPARENZHINWEIS]`,
    verguetung: "offen",
    zulaessigeKontaktwege: ["email"],
    integration: { art: "keine" },
  };
}

export const partner: Partner[] = ["01", "02", "03", "04"].map(platzhalter);

export function istAuswaehlbar(p: Partner): boolean {
  return p.status === "aktiv" && p.vereinbarung === "abgeschlossen";
}

export function aktivePartner(): Partner[] {
  return partner.filter(istAuswaehlbar);
}

export function findePartner(id: string): Partner | undefined {
  return partner.find((p) => p.id === id);
}

/**
 * Empfänger „Plattform“: Solange kein Partner aktiv ist, gehen Anfragen
 * ausschließlich an die Plattform selbst und werden nicht weitergegeben.
 */
export const EMPFAENGER_PLATTFORM = "plattform";
