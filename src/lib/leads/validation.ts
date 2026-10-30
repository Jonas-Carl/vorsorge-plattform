import { EMPFAENGER_PLATTFORM, findePartner, istAuswaehlbar } from "@/config/partner";
import { site } from "@/config/site";
import type { Lang } from "@/lib/format";
import { pruefeQualifikation, pruefeRechner, type Qualifikation, type RechnerUebergabe } from "./qualifikation";
import type { Anliegen, Attribution, Feldfehler, Kontaktweg, Kontaktzeit, LeadAnfrage } from "./types";

export const EINWILLIGUNGSTEXT_VERSION = "2026-10-29.1";

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
      de: `Ich bin einverstanden, dass ${site.name} meine Angaben aus diesem Formular an einen passenden Berater aus seiner Partnerliste in meiner Nähe weitergibt und dieser mich telefonisch oder per E-Mail zu meiner Anfrage kontaktiert. Wer das ist, erfahre ich per E-Mail. Ich kann diese Einwilligung jederzeit widerrufen.`,
      en: `I agree that ${site.name} passes the details from this form on to a suitable adviser near me from its partner list, and that this adviser contacts me by phone or email about my request. I will be told by email who it is. I can withdraw this consent at any time.`,
      fr: `J'accepte que ${site.name} transmette les données de ce formulaire à un conseiller adapté près de chez moi figurant sur sa liste de partenaires, et que ce conseiller me contacte par téléphone ou par e-mail au sujet de ma demande. Je serai informé(e) par e-mail de qui il s'agit. Je peux retirer ce consentement à tout moment.`,
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
    vornameFehlt: "Bitte gib deinen Namen an.",
    vornamePruefen: "Bitte prüfe deinen Namen.",
    nachnameFehlt: "Bitte gib deinen Nachnamen an.",
    nachnamePruefen: "Bitte prüfe deinen Nachnamen.",
    emailFehlt: "Bitte gib deine E-Mail-Adresse an.",
    emailPruefen: "Diese E-Mail-Adresse sieht nicht vollständig aus. Ein Beispiel: name@beispiel.de",
    kontaktweg: "Bitte wähle, wie wir uns melden sollen.",
    telefonFehlt: "Bitte gib deine Telefonnummer an – so kann sich dein Berater am schnellsten melden.",
    telefonPruefen: "Bitte gib die Telefonnummer nur mit Ziffern, Leerzeichen und einem + am Anfang an.",
    plzPruefen: "Eine Postleitzahl hat fünf Ziffern, zum Beispiel 49088.",
    plzFehlt: "Bitte gib deine Postleitzahl an – damit wir jemanden in deiner Nähe finden.",
    ziel: "Bitte wähle aus, worum es dir geht.",
    frageFehlt: "Bitte schreib kurz, worum es dir geht.",
    alter: "Bitte gib dein Alter an.",
    beruf: "Bitte wähle aus, was du beruflich machst.",
    sparbetrag: "Bitte wähle, wie viel du ungefähr sparen möchtest.",
    start: "Bitte wähle, wann du starten möchtest.",
    kontaktzeit: "Bitte wähle eine Zeit.",
    anliegen: "Bitte wähle aus, worum es geht.",
    empfaenger: "Bitte wähle aus, an wen deine Frage gehen soll.",
    kontaktwegPartner: "Dieser Weg ist beim gewählten Partner nicht möglich.",
    einwilligung: "Bitte setze das Häkchen. Ohne dein Ja können wir die Frage nicht bearbeiten.",
  },
  en: {
    vornameFehlt: "Please enter your name.",
    vornamePruefen: "Please check your name.",
    nachnameFehlt: "Please enter your last name.",
    nachnamePruefen: "Please check your last name.",
    emailFehlt: "Please enter your email address.",
    emailPruefen: "This email address does not look complete. An example: name@example.com",
    kontaktweg: "Please choose how we should contact you.",
    telefonFehlt: "Please enter your phone number – that is the quickest way for your adviser to reach you.",
    telefonPruefen: "Please enter the phone number with digits, spaces and an optional + at the start only.",
    plzPruefen: "A German postcode has five digits, for example 49088.",
    plzFehlt: "Please enter your postcode – so that we can find someone near you.",
    ziel: "Please choose what it is about for you.",
    frageFehlt: "Please write briefly what it is about.",
    alter: "Please enter your age.",
    beruf: "Please choose what you do for a living.",
    sparbetrag: "Please choose roughly how much you want to save.",
    start: "Please choose when you want to start.",
    kontaktzeit: "Please choose a time.",
    anliegen: "Please choose what it is about.",
    empfaenger: "Please choose who your question should go to.",
    kontaktwegPartner: "This way of contact is not possible with the chosen partner.",
    einwilligung: "Please tick the box. Without your yes we cannot handle the question.",
  },
  fr: {
    vornameFehlt: "Indique ton nom, s'il te plaît.",
    vornamePruefen: "Vérifie ton prénom, s'il te plaît.",
    nachnameFehlt: "Indique ton nom, s'il te plaît.",
    nachnamePruefen: "Vérifie ton nom, s'il te plaît.",
    emailFehlt: "Indique ton adresse e-mail, s'il te plaît.",
    emailPruefen: "Cette adresse e-mail semble incomplète. Un exemple : nom@exemple.fr",
    kontaktweg: "Choisis comment nous devons te répondre.",
    telefonFehlt: "Indique ton numéro de téléphone – c'est le plus rapide pour ton conseiller.",
    telefonPruefen: "Écris le numéro uniquement avec des chiffres, des espaces et un + au début.",
    plzPruefen: "Un code postal allemand a cinq chiffres, par exemple 49088.",
    plzFehlt: "Indique ton code postal – pour que nous trouvions quelqu'un près de chez toi.",
    ziel: "Choisis ce qui t'intéresse.",
    frageFehlt: "Écris brièvement de quoi il s'agit.",
    alter: "Indique ton âge, s'il te plaît.",
    beruf: "Choisis ce que tu fais professionnellement.",
    sparbetrag: "Choisis combien tu veux épargner à peu près.",
    start: "Choisis quand tu veux commencer.",
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
  plz?: string;
  kontaktweg: Kontaktweg;
  qualifikation: Qualifikation;
  rechner?: RechnerUebergabe;
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
const PLZ = /^[0-9]{5}$/;
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
  const plz = text(a.plz, 10).replace(/\s/g, "");
  const nachricht = text(a.nachricht, 1000);
  const empfaengerId = text(a.empfaengerId, 40);
  const kontaktweg = a.kontaktweg === "telefon" ? "telefon" : a.kontaktweg === "email" ? "email" : null;
  const kontaktzeit = KONTAKTZEITEN.find((k) => k === a.kontaktzeit) ?? null;
  const anliegen = ANLIEGEN.find((k) => k === a.anliegen) ?? null;

  if (!vorname) fehler.vorname = m.vornameFehlt;
  else if (!NAME.test(vorname)) fehler.vorname = m.vornamePruefen;

  // Nachname ist freiwillig – weniger Pflichtfelder, weniger Hürde.
  if (nachname && !NAME.test(nachname)) fehler.nachname = m.nachnamePruefen;

  if (!email) fehler.email = m.emailFehlt;
  else if (!EMAIL.test(email)) fehler.email = m.emailPruefen;

  if (!kontaktweg) fehler.kontaktweg = m.kontaktweg;
  // Telefonnummer ist Pflicht: Berater melden sich meist telefonisch.
  if (!telefon) fehler.telefon = m.telefonFehlt;
  else if (telefon && !TELEFON.test(telefon)) fehler.telefon = m.telefonPruefen;

  if (!plz) fehler.plz = m.plzFehlt;
  else if (!PLZ.test(plz)) fehler.plz = m.plzPruefen;

  const quali = pruefeQualifikation(a.qualifikation);
  if (quali.fehler.ziel) fehler.ziel = m.ziel;
  // „Sonstige Fragen“: Ohne eigenen Text wüsste niemand, worum es geht.
  if (quali.daten.ziel === "sonstiges" && !nachricht) fehler.nachricht = m.frageFehlt;
  if (quali.fehler.beruf) fehler.beruf = m.beruf;

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
      plz: plz || undefined,
      kontaktweg,
      qualifikation: quali.daten,
      rechner: pruefeRechner(a.rechner),
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
