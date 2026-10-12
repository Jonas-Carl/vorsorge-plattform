import { EMPFAENGER_PLATTFORM, findePartner, istAuswaehlbar } from "@/config/partner";
import { site } from "@/config/site";
import type { Lang } from "@/lib/format";
import type { Anliegen, Attribution, Feldfehler, Kontaktweg, Kontaktzeit, LeadAnfrage } from "./types";

export const EINWILLIGUNGSTEXT_VERSION = "2026-10-11.2";

export const ANLIEGEN: Anliegen[] = ["allgemein", "reform-2027", "foerderung", "familie", "bestehender-vertrag"];
export const KONTAKTZEITEN: Kontaktzeit[] = ["egal", "vormittags", "nachmittags", "abends"];

export const sprache = (x: unknown): Lang => (x === "en" || x === "fr" ? x : "de");

/** Name des Empfängers, wie er dem Nutzer angezeigt wird. Null = nicht auswählbar. */
export function empfaengerName(id: string): string | null {
  if (id === EMPFAENGER_PLATTFORM) return site.name;
  const p = findePartner(id);
  return p && istAuswaehlbar(p) ? p.name : null;
}

/** Wortlaut der Bestätigung – wird exakt so angezeigt UND als Nachweis gespeichert. */
export function einwilligungstext(empfaengerId: string, lang: Lang = "de"): string {
  if (empfaengerId === EMPFAENGER_PLATTFORM) {
    return {
      de: `Ich möchte, dass ${site.name} sich zu meiner Frage bei mir meldet – auf dem Weg, den ich gewählt habe. Meine Angaben werden nur dafür verwendet und nicht an andere weitergegeben.`,
      en: `I would like ${site.name} to contact me about my question in the way I chose. My details are used only for this and are not passed on to anyone else.`,
      fr: `Je souhaite que ${site.name} me recontacte au sujet de ma question, par le moyen que j'ai choisi. Mes données servent uniquement à cela et ne sont transmises à personne d'autre.`,
    }[lang];
  }
  const ohneName = { de: "den gewählten Partner", en: "the chosen partner", fr: "le partenaire choisi" }[lang];
  const name = empfaengerName(empfaengerId) ?? ohneName;
  return {
    de: `Ich bin einverstanden, dass ${site.name} meine Kontaktdaten von oben und meine Frage an ${name} weitergibt, damit ${name} sich dazu bei mir meldet – auf dem Weg, den ich gewählt habe. Das ist freiwillig. Ich kann es jederzeit für die Zukunft widerrufen.`,
    en: `I agree that ${site.name} passes my contact details above and my question on to ${name}, so that ${name} can contact me about it in the way I chose. This consent is voluntary. I can withdraw it at any time for the future.`,
    fr: `J'accepte que ${site.name} transmette mes coordonnées ci-dessus et ma question à ${name}, afin que ${name} me recontacte à ce sujet par le moyen que j'ai choisi. Ce consentement est facultatif. Je peux le retirer à tout moment pour l'avenir.`,
  }[lang];
}

const MELDUNGEN = {
  de: {
    vornameFehlt: "Bitte gib deinen Vornamen an.",
    vornamePruefen: "Bitte prüfe deinen Vornamen.",
    nachnameFehlt: "Bitte gib deinen Nachnamen an.",
    nachnamePruefen: "Bitte prüfe deinen Nachnamen.",
    emailFehlt: "Bitte gib deine E-Mail-Adresse an.",
    emailPruefen: "Diese E-Mail-Adresse sieht nicht vollständig aus. Ein Beispiel: name@beispiel.de",
    kontaktweg: "Bitte wähle, wie wir uns melden sollen.",
    telefonFehlt: "Für einen Anruf brauchen wir deine Telefonnummer.",
    telefonPruefen: "Bitte gib die Telefonnummer nur mit Ziffern, Leerzeichen und einem + am Anfang an.",
    kontaktzeit: "Bitte wähle eine Zeit.",
    anliegen: "Bitte wähle aus, worum es geht.",
    empfaenger: "Bitte wähle aus, an wen deine Frage gehen soll.",
    kontaktwegPartner: "Dieser Weg ist beim gewählten Partner nicht möglich.",
    einwilligung: "Bitte setze das Häkchen. Ohne dein Ja können wir die Frage nicht bearbeiten.",
  },
  en: {
    vornameFehlt: "Please enter your first name.",
    vornamePruefen: "Please check your first name.",
    nachnameFehlt: "Please enter your last name.",
    nachnamePruefen: "Please check your last name.",
    emailFehlt: "Please enter your email address.",
    emailPruefen: "This email address does not look complete. An example: name@example.com",
    kontaktweg: "Please choose how we should contact you.",
    telefonFehlt: "For a call we need your phone number.",
    telefonPruefen: "Please enter the phone number with digits, spaces and an optional + at the start only.",
    kontaktzeit: "Please choose a time.",
    anliegen: "Please choose what it is about.",
    empfaenger: "Please choose who your question should go to.",
    kontaktwegPartner: "This way of contact is not possible with the chosen partner.",
    einwilligung: "Please tick the box. Without your yes we cannot handle the question.",
  },
  fr: {
    vornameFehlt: "Indique ton prénom, s'il te plaît.",
    vornamePruefen: "Vérifie ton prénom, s'il te plaît.",
    nachnameFehlt: "Indique ton nom, s'il te plaît.",
    nachnamePruefen: "Vérifie ton nom, s'il te plaît.",
    emailFehlt: "Indique ton adresse e-mail, s'il te plaît.",
    emailPruefen: "Cette adresse e-mail semble incomplète. Un exemple : nom@exemple.fr",
    kontaktweg: "Choisis comment nous devons te répondre.",
    telefonFehlt: "Pour un appel, nous avons besoin de ton numéro de téléphone.",
    telefonPruefen: "Écris le numéro uniquement avec des chiffres, des espaces et un + au début.",
    kontaktzeit: "Choisis un moment, s'il te plaît.",
    anliegen: "Choisis de quoi il s'agit.",
    empfaenger: "Choisis à qui ta question doit être envoyée.",
    kontaktwegPartner: "Ce moyen de contact n'est pas possible avec le partenaire choisi.",
    einwilligung: "Coche la case, s'il te plaît. Sans ton accord, nous ne pouvons pas traiter la question.",
  },
} satisfies Record<Lang, Record<string, string>>;

export type GepruefteAnfrage = {
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  kontaktweg: Kontaktweg;
  kontaktzeit: Kontaktzeit;
  anliegen: Anliegen;
  nachricht?: string;
  empfaengerId: string;
  idempotenzSchluessel: string;
  attribution: Attribution;
  sprache: Lang;
};

const text = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max) : "";

const NAME = /^[\p{L}][\p{L}\p{M}'’ .-]{0,59}$/u;
// Bewusst pragmatisch: ein @, keine Leerzeichen, Domain mit Punkt.
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@.]{2,}$/;
const TELEFON = /^\+?[0-9][0-9 ()/-]{5,24}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KAMPAGNE = /^[\w .\-]{1,80}$/;

function pruefeAttribution(roh: unknown): Attribution {
  if (!roh || typeof roh !== "object") return {};
  const r = roh as Record<string, unknown>;
  const feld = (k: string) => {
    const v = text(r[k], 80);
    return KAMPAGNE.test(v) ? v : undefined;
  };
  const einstiegRoh = text(r.einstieg, 120);
  // Nur Pfade ohne Query-String – keine personenbezogenen Daten aus URLs übernehmen.
  const einstieg = /^\/[\w\-/]*$/.test(einstiegRoh) ? einstiegRoh : undefined;
  return { quelle: feld("quelle"), medium: feld("medium"), kampagne: feld("kampagne"), einstieg };
}

/**
 * Validierung einer Kontaktanfrage. Läuft identisch im Browser (Sofort-Feedback)
 * und auf dem Server (maßgeblich). Fehlermeldungen in der Sprache der Anfrage.
 */
export function pruefeAnfrage(
  a: LeadAnfrage,
): { ok: true; daten: GepruefteAnfrage } | { ok: false; fehler: Feldfehler } {
  const lang = sprache(a.sprache);
  const m = MELDUNGEN[lang];
  const fehler: Feldfehler = {};

  const vorname = text(a.vorname, 60);
  const nachname = text(a.nachname, 60);
  const email = text(a.email, 254).toLowerCase();
  const telefon = text(a.telefon, 25);
  const nachricht = text(a.nachricht, 1000);
  const empfaengerId = text(a.empfaengerId, 40);
  const kontaktweg = a.kontaktweg === "telefon" ? "telefon" : a.kontaktweg === "email" ? "email" : null;
  const kontaktzeit = KONTAKTZEITEN.find((k) => k === a.kontaktzeit) ?? null;
  const anliegen = ANLIEGEN.find((k) => k === a.anliegen) ?? null;

  if (!vorname) fehler.vorname = m.vornameFehlt;
  else if (!NAME.test(vorname)) fehler.vorname = m.vornamePruefen;

  if (!nachname) fehler.nachname = m.nachnameFehlt;
  else if (!NAME.test(nachname)) fehler.nachname = m.nachnamePruefen;

  if (!email) fehler.email = m.emailFehlt;
  else if (!EMAIL.test(email)) fehler.email = m.emailPruefen;

  if (!kontaktweg) fehler.kontaktweg = m.kontaktweg;
  if (kontaktweg === "telefon" && !telefon) fehler.telefon = m.telefonFehlt;
  else if (telefon && !TELEFON.test(telefon)) fehler.telefon = m.telefonPruefen;

  if (!kontaktzeit) fehler.kontaktzeit = m.kontaktzeit;
  if (!anliegen) fehler.anliegen = m.anliegen;

  if (!empfaengerName(empfaengerId)) fehler.empfaengerId = m.empfaenger;
  else if (empfaengerId !== EMPFAENGER_PLATTFORM && kontaktweg) {
    const p = findePartner(empfaengerId);
    if (p && !p.zulaessigeKontaktwege.includes(kontaktweg)) fehler.kontaktweg = m.kontaktwegPartner;
  }

  if (a.einwilligung !== true) fehler.einwilligung = m.einwilligung;

  const idempotenzSchluessel = text(a.idempotenzSchluessel, 40);

  if (Object.keys(fehler).length > 0 || !kontaktweg || !kontaktzeit || !anliegen) {
    return { ok: false, fehler };
  }
  if (!UUID.test(idempotenzSchluessel)) {
    // Technischer Fehler des Clients, kein Nutzerfehler.
    return { ok: false, fehler: {} };
  }

  return {
    ok: true,
    daten: {
      vorname,
      nachname,
      email,
      telefon: telefon || undefined,
      kontaktweg,
      kontaktzeit,
      anliegen,
      nachricht: nachricht || undefined,
      empfaengerId,
      idempotenzSchluessel,
      attribution: pruefeAttribution(a.attribution),
      sprache: lang,
    },
  };
}
