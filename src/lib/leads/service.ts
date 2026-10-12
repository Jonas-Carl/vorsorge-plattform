import { randomUUID } from "node:crypto";
import { uebergebeLead } from "./delivery";
import type { LeadRepository } from "./repository";
import type { Lead, LeadAnfrage, LeadAntwort, LeadStatus } from "./types";
import { EINWILLIGUNGSTEXT_VERSION, einwilligungstext, empfaengerName, pruefeAnfrage, sprache } from "./validation";

const M = {
  de: {
    ungueltig: "Die Anfrage konnte nicht verarbeitet werden. Bitte lade die Seite neu und versuche es noch einmal.",
    unvollstaendig: "Die Anfrage war unvollständig. Bitte lade die Seite neu.",
    keinSpeicher: "Im Moment können wir technisch noch keine Fragen annehmen. Deine Angaben wurden nicht gespeichert und nicht weitergegeben.",
  },
  en: {
    ungueltig: "The request could not be processed. Please reload the page and try again.",
    unvollstaendig: "The request was incomplete. Please reload the page.",
    keinSpeicher: "At the moment we cannot technically accept questions yet. Your details were not saved and not passed on.",
  },
  fr: {
    ungueltig: "La demande n'a pas pu être traitée. Recharge la page et réessaie.",
    unvollstaendig: "La demande était incomplète. Recharge la page, s'il te plaît.",
    keinSpeicher: "Pour l'instant, nous ne pouvons techniquement pas encore recevoir de questions. Tes données n'ont été ni enregistrées ni transmises.",
  },
} as const;

/** Aufbewahrung offener Anfragen bis zur Löschung (Vorschlag – rechtlich zu prüfen). */
export const AUFBEWAHRUNG_TAGE = 180;
/** Fenster, in dem eine identische Anfrage als Duplikat gilt. */
const DUPLIKAT_FENSTER_MS = 10 * 60 * 1000;
/** Schnellere Absendungen gelten als automatisiert. */
const MIN_AUSFUELLDAUER_MS = 2500;

type Abhaengigkeiten = {
  repo: LeadRepository | null;
  uebergabe?: typeof uebergebeLead;
  jetzt?: () => Date;
};

/**
 * Verarbeitet eine Kontaktanfrage: Spam-Prüfung → Validierung → Duplikatschutz →
 * Speicherung → (falls vorgesehen) Partner-Übergabe. Die Antwort gibt den
 * tatsächlichen Stand wieder.
 */
export async function verarbeiteAnfrage(roh: LeadAnfrage, dep: Abhaengigkeiten): Promise<{ status: number; antwort: LeadAntwort }> {
  const jetzt = (dep.jetzt ?? (() => new Date()))();
  const uebergabe = dep.uebergabe ?? uebergebeLead;
  const m = M[sprache(roh.sprache)];

  // Spam: ausgefülltes Honeypot-Feld oder unrealistisch schnelles Absenden.
  const zuSchnell = typeof roh.ausfuelldauerMs !== "number" || roh.ausfuelldauerMs < MIN_AUSFUELLDAUER_MS;
  if ((typeof roh.website === "string" && roh.website.trim() !== "") || zuSchnell) {
    return {
      status: 400,
      antwort: {
        ok: false,
        code: "ungueltige_anfrage",
        meldung: m.ungueltig,
      },
    };
  }

  const pruefung = pruefeAnfrage(roh);
  if (!pruefung.ok) {
    if (Object.keys(pruefung.fehler).length === 0) {
      return {
        status: 400,
        antwort: { ok: false, code: "ungueltige_anfrage", meldung: m.unvollstaendig },
      };
    }
    return { status: 422, antwort: { ok: false, code: "validierung", fehler: pruefung.fehler } };
  }
  const d = pruefung.daten;
  const name = empfaengerName(d.empfaengerId)!;

  if (!dep.repo) {
    return {
      status: 503,
      antwort: {
        ok: false,
        code: "speicher_nicht_verfuegbar",
        meldung: m.keinSpeicher,
      },
    };
  }

  // Duplikatschutz: gleicher Schlüssel (Doppelklick, Wiederholung) oder gleiche
  // E-Mail an denselben Empfänger innerhalb weniger Minuten.
  const vorhanden =
    (await dep.repo.findeNachIdempotenzSchluessel(d.idempotenzSchluessel)) ??
    (await dep.repo.findeAktuelleAnfrage(
      d.email,
      d.empfaengerId,
      new Date(jetzt.getTime() - DUPLIKAT_FENSTER_MS).toISOString(),
    ));
  if (vorhanden) {
    return {
      status: 200,
      antwort: {
        ok: true,
        leadId: vorhanden.id,
        uebermittlung: vorhanden.uebermittlung.status,
        empfaengerName: name,
        duplikat: true,
      },
    };
  }

  const zeit = jetzt.toISOString();
  const lead: Lead = {
    id: randomUUID(),
    erstelltAm: zeit,
    aktualisiertAm: zeit,
    empfaengerId: d.empfaengerId,
    kontakt: {
      vorname: d.vorname,
      nachname: d.nachname,
      email: d.email,
      telefon: d.telefon,
      kontaktweg: d.kontaktweg,
      kontaktzeit: d.kontaktzeit,
    },
    anliegen: d.anliegen,
    nachricht: d.nachricht,
    status: "validiert",
    uebermittlung: { status: "nicht_vorgesehen", versuche: 0 },
    einwilligungen: [
      {
        zweck: "kontaktaufnahme_und_weitergabe",
        textVersion: EINWILLIGUNGSTEXT_VERSION,
        wortlaut: einwilligungstext(d.empfaengerId, d.sprache),
        erteiltAm: zeit,
        empfaenger: d.empfaengerId,
      },
    ],
    attribution: d.attribution,
    wertschoepfung: {},
    sprache: d.sprache,
    idempotenzSchluessel: d.idempotenzSchluessel,
    loeschenBis: new Date(jetzt.getTime() + AUFBEWAHRUNG_TAGE * 86_400_000).toISOString(),
  };

  await dep.repo.speichere(lead);

  const ergebnis = await uebergabe(lead);
  const statusNachUebergabe: Record<typeof ergebnis.status, LeadStatus> = {
    nicht_vorgesehen: "in_bearbeitung",
    ausstehend: "zur_uebermittlung_bereit",
    erfolgreich: "erfolgreich_uebermittelt",
    fehlgeschlagen: "uebermittlung_fehlgeschlagen",
  };
  lead.status = statusNachUebergabe[ergebnis.status];
  lead.uebermittlung = {
    status: ergebnis.status,
    versuche: ergebnis.status === "erfolgreich" || ergebnis.status === "fehlgeschlagen" ? 1 : 0,
    letzterVersuchAm: ergebnis.status === "nicht_vorgesehen" ? undefined : zeit,
    fehler: ergebnis.fehler,
  };
  if (ergebnis.status === "erfolgreich") lead.wertschoepfung.uebergebenAm = zeit;
  await dep.repo.aktualisiere(lead);

  return {
    status: 201,
    antwort: { ok: true, leadId: lead.id, uebermittlung: ergebnis.status, empfaengerName: name, duplikat: false },
  };
}
