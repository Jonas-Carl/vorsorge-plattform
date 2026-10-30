"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EMPFAENGER_PLATTFORM } from "@/config/partner";
import { site } from "@/config/site";
import { pfad, type Lang } from "@/i18n";
import { texte } from "@/i18n/texte";
import { merkeAttribution, track } from "@/lib/analytics";
import { euro } from "@/lib/format";
import {
  BERUFE, LEERE_QUALIFIKATION, pruefeRechner, RECHNER_UEBERGABE, ZIELE,
  type Qualifikation, type RechnerUebergabe, type Ziel,
} from "@/lib/leads/qualifikation";
import type { Anliegen, Feldfehler, Kontaktzeit, LeadAntwort } from "@/lib/leads/types";
import { EINWILLIGUNGSTEXT_VERSION, einwilligungstext, pruefeAnfrage } from "@/lib/leads/validation";

type Felder = {
  vorname: string; nachname: string; email: string; telefon: string; plz: string;
  kontaktweg: "email" | "telefon"; kontaktzeit: Kontaktzeit; anliegen: Anliegen; nachricht: string;
  empfaengerId: string; einwilligung: boolean; website: string;
};

const LEER: Felder = {
  vorname: "", nachname: "", email: "", telefon: "", plz: "", kontaktweg: "telefon", kontaktzeit: "egal",
  // Anfragen gehen immer zuerst an uns. An einen Berater geben wir erst nach einem zweiten, ausdrücklichen Ja weiter.
  anliegen: "allgemein", nachricht: "", empfaengerId: EMPFAENGER_PLATTFORM, einwilligung: false, website: "",
};

type Zustand =
  | { art: "bereit" }
  | { art: "sendet" }
  | { art: "erfolg"; antwort: Extract<LeadAntwort, { ok: true }> }
  | { art: "fehler"; meldung: string }
  | { art: "email" }
  | { art: "gesendet" };

const jetzt = () => Date.now();

/** Das Ziel bestimmt das Thema der Anfrage (für Betreff und Auswertung). */
const ANLIEGEN_ZU_ZIEL: Record<Ziel, Anliegen> = {
  starten: "allgemein", pruefen: "bestehender-vertrag", foerderung: "foerderung", kennenlernen: "allgemein", sonstiges: "allgemein",
};

/** Statische Vorschau (GitHub Pages): Es gibt keinen Server, der Fragen annehmen könnte. */
const VORSCHAU = process.env.NEXT_PUBLIC_DEMO === "1";
/**
 * Statische Fassung ohne Server (z. B. einfaches Webhosting): Die Anfrage wird als fertig
 * ausgefüllte E-Mail an die Betreiber-Adresse geöffnet, statt an /api/leads geschickt.
 */
const PER_EMAIL = process.env.NEXT_PUBLIC_ANFRAGE_PER_EMAIL === "1";
/**
 * Versand über ein kleines Skript auf dem Webspace (hosting/anfrage.php): Die Anfrage geht
 * direkt als E-Mail an unser Postfach – ohne dass sich das Mailprogramm der Besucher öffnet.
 * Hat Vorrang vor PER_EMAIL; PER_EMAIL bleibt als Ausweg, falls das Skript nicht erreichbar ist.
 */
const ZIEL = process.env.NEXT_PUBLIC_ANFRAGE_ZIEL ?? "";
const VORSCHAU_TEXT = {
  de: "Das ist nur eine Vorschau der Seite. Hier kann noch nichts abgeschickt werden. Deine Angaben wurden nicht gespeichert und nicht übertragen.",
  en: "This is only a preview of the site. Nothing can be sent here yet. Your details were not saved and not transmitted.",
  fr: "Ceci n'est qu'un aperçu du site. Rien ne peut encore être envoyé ici. Tes données n'ont été ni enregistrées ni transmises.",
} as const;

const REIHENFOLGE: (keyof Feldfehler)[] = [
  "ziel", "nachricht", "beruf", "vorname", "nachname", "email", "plz", "kontaktweg", "telefon", "kontaktzeit", "anliegen", "nachricht", "empfaengerId", "einwilligung",
];

/** Technische Fehler, die der Server nicht in der Sprache der Anfrage formuliert. */
const TECHNIK = {
  de: {
    zu_viele_anfragen: "Das waren zu viele Versuche in kurzer Zeit. Bitte warte ein paar Minuten.",
    serverfehler: "Es gab einen technischen Fehler. Deine Frage wurde nicht gespeichert. Bitte versuche es später noch einmal.",
    ungueltige_anfrage: "Das hat nicht geklappt. Bitte lade die Seite neu und versuche es noch einmal.",
  },
  en: {
    zu_viele_anfragen: "That was too many attempts in a short time. Please wait a few minutes.",
    serverfehler: "There was a technical error. Your question was not saved. Please try again later.",
    ungueltige_anfrage: "That did not work. Please reload the page and try again.",
  },
  fr: {
    zu_viele_anfragen: "Trop d'essais en peu de temps. Attends quelques minutes, s'il te plaît.",
    serverfehler: "Il y a eu une erreur technique. Ta question n'a pas été enregistrée. Réessaie plus tard.",
    ungueltige_anfrage: "Cela n'a pas fonctionné. Recharge la page et réessaie.",
  },
} as const;

export function LeadForm({ lang }: { lang: Lang }) {
  const t = texte(lang).anfrage;
  const [f, setF] = useState<Felder>(LEER);
  const [q, setQ] = useState<Qualifikation>(LEERE_QUALIFIKATION);
  // Werte aus dem Rechner: nur sichtbar übernommen und nur mitgeschickt, solange die Person es so lässt.
  const [rechner, setRechner] = useState<RechnerUebergabe | null>(null);
  const [rechnerMit, setRechnerMit] = useState(true);
  const [fehler, setFehler] = useState<Feldfehler>({});
  const [zustand, setZustand] = useState<Zustand>({ art: "bereit" });
  const schluessel = useRef<string>("");
  const geladenAm = useRef<number>(0);
  const erfolgRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    schluessel.current = crypto.randomUUID();
    geladenAm.current = jetzt();
    merkeAttribution();
    try {
      const r = pruefeRechner(JSON.parse(window.sessionStorage.getItem(RECHNER_UEBERGABE) ?? "null"));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- einmalige Übernahme aus dem Browser-Speicher
      if (r) setRechner(r);
    } catch {
      // Kein Speicher verfügbar – dann eben ohne Vorbelegung.
    }
  }, []);

  useEffect(() => {
    if (zustand.art === "erfolg" || zustand.art === "gesendet") erfolgRef.current?.focus();
  }, [zustand.art]);

  const setzeQ = <K extends keyof Qualifikation>(k: K, v: Qualifikation[K]) => {
    setQ((alt) => ({ ...alt, [k]: v }));
    if (fehler[k as keyof Feldfehler]) setFehler((alt) => ({ ...alt, [k]: undefined }));
  };

  /** Lesbare Zusammenfassung für die E-Mail an uns (Situation + Rechner). */
  function situationZeilen(): string[] {
    const z = t.quali;
    const zeilen = [
      q.ziel && `${z.ziel} ${z.ziele[q.ziel]}`,
      q.start && `${z.start} ${z.starts[q.start]}`,
      q.sparbetrag && `${z.sparbetrag} ${z.sparbetraege[q.sparbetrag]}`,
      q.alter !== undefined && `${z.alter} ${q.alter} ${z.alterEinheit}`,
      q.beruf && `${z.beruf} ${z.berufe[q.beruf]}`,
      q.kinder && `${z.kinder} ${z.kinderListe[q.kinder]}`,
      q.vorsorge.length > 0 && `${z.vorsorge} ${q.vorsorge.map((v) => z.vorsorgen[v]).join(", ")}`,
      q.einkommen && `${z.einkommen}: ${z.einkommenListe[q.einkommen]}`,
    ].filter((x): x is string => Boolean(x));
    if (rechner && rechnerMit) zeilen.push(`${z.rechnerTitel.split(" – ")[0]}: ${rechnerText(rechner)}`);
    return zeilen;
  }
  const rechnerText = (r: RechnerUebergabe) =>
    t.quali.rechnerWerte(r.alter, euro(r.sparrate, lang), r.kinder, r.rentenalter, euro(r.zuschussJahr, lang), euro(r.endkapital, lang));

  const setze = <K extends keyof Felder>(k: K, v: Felder[K]) => {
    setF((alt) => ({ ...alt, [k]: v }));
    if (fehler[k as keyof Feldfehler]) setFehler((alt) => ({ ...alt, [k]: undefined }));
  };


  async function absenden(ev: React.FormEvent) {
    ev.preventDefault();
    if (zustand.art === "sendet") return;

    // Der Textkasten gehört zu „Sonstige Fragen“ – ausgeblendeter Text wird nicht mitgeschickt.
    const nachrichtSichtbar = q.ziel === "sonstiges" ? f.nachricht : "";
    // Ein Feld „Vor- und Nachname“: das erste Wort ist der Vorname, der Rest der Nachname.
    const [vorname = "", ...rest] = f.vorname.trim().split(/\s+/);
    const anfrage = {
      ...f,
      vorname,
      nachname: rest.join(" "),
      anliegen: q.ziel ? ANLIEGEN_ZU_ZIEL[q.ziel] : f.anliegen,
      qualifikation: q,
      rechner: rechner && rechnerMit ? rechner : undefined,
      telefon: f.telefon || undefined,
      plz: f.plz || undefined,
      nachricht: nachrichtSichtbar || undefined,
      sprache: lang,
      idempotenzSchluessel: schluessel.current,
      ausfuelldauerMs: jetzt() - geladenAm.current,
      attribution: merkeAttribution(),
    };

    const lokal = pruefeAnfrage(anfrage);
    if (!lokal.ok) {
      zeigeFehler(lokal.fehler);
      return;
    }

    if (VORSCHAU) {
      setZustand({ art: "fehler", meldung: VORSCHAU_TEXT[lang] });
      return;
    }

    if (ZIEL) {
      setZustand({ art: "sendet" });
      try {
        const res = await fetch(ZIEL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...anfrage,
            anliegenText: q.ziel ? t.quali.ziele[q.ziel] : t.themen[f.anliegen],
            situation: situationZeilen(),
            kontaktzeitText: t.zeiten[f.kontaktzeit],
            einwilligungstext: einwilligungstext(f.empfaengerId, lang),
            einwilligungVersion: EINWILLIGUNGSTEXT_VERSION,
          }),
        });
        const antwort = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean; code?: string };
        if (antwort.ok) {
          track("anfrage_abgeschickt", { partner: false, weg: "formular" });
          setZustand({ art: "gesendet" });
          return;
        }
        track("anfrage_fehlgeschlagen", { code: antwort.code ?? "unbekannt" });
        const code = antwort.code === "zu_viele_anfragen" ? "zu_viele_anfragen" : "serverfehler";
        setZustand({ art: "fehler", meldung: `${TECHNIK[lang][code]} ${t.perMailAusweg(site.betreiber.email)}` });
      } catch {
        track("anfrage_fehlgeschlagen", { code: "netzwerk" });
        setZustand({ art: "fehler", meldung: `${t.netzFehler} ${t.perMailAusweg(site.betreiber.email)}` });
      }
      return;
    }

    if (PER_EMAIL) {
      const m = t.perEmail;
      const zeilen = [
        `${m.felder.name}: ${f.vorname} ${f.nachname}`.trim(),
        `${m.felder.email}: ${f.email}`,
        ...(f.plz ? [`${m.felder.plz}: ${f.plz}`] : []),
        `${m.felder.weg}: ${f.kontaktweg === "telefon" ? t.perTelefon : t.perMail}`,
        ...(f.telefon ? [`${m.felder.telefon}: ${f.telefon}`] : []),
        ...(f.kontaktweg === "telefon" ? [`${m.felder.zeit}: ${t.zeiten[f.kontaktzeit]}`] : []),
        `${m.felder.thema}: ${t.themen[f.anliegen]}`,
        "",
        `— ${t.quali.mailTitel} —`,
        ...situationZeilen(),
        ...(nachrichtSichtbar ? ["", `${m.felder.nachricht}:`, nachrichtSichtbar] : []),
        "",
        einwilligungstext(f.empfaengerId, lang),
      ];
      const betreff = `${m.betreff} – ${t.themen[f.anliegen]}`;
      track("anfrage_abgeschickt", { partner: false, weg: "email" });
      window.location.assign(`mailto:${site.betreiber.email}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(zeilen.join("\n"))}`);
      setZustand({ art: "email" });
      return;
    }

    setZustand({ art: "sendet" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anfrage),
      });
      const antwort = (await res.json()) as LeadAntwort;
      if (antwort.ok) {
        track("anfrage_abgeschickt", { partner: false });
        setZustand({ art: "erfolg", antwort });
        return;
      }
      track("anfrage_fehlgeschlagen", { code: antwort.code });
      if (antwort.code === "validierung") {
        setZustand({ art: "bereit" });
        zeigeFehler(antwort.fehler);
      } else {
        setZustand({
          art: "fehler",
          meldung: antwort.code === "speicher_nicht_verfuegbar" ? antwort.meldung : TECHNIK[lang][antwort.code],
        });
      }
    } catch {
      track("anfrage_fehlgeschlagen", { code: "netzwerk" });
      setZustand({ art: "fehler", meldung: t.netzFehler });
    }
  }

  function zeigeFehler(neu: Feldfehler) {
    setFehler(neu);
    const erstes = REIHENFOLGE.find((k) => neu[k]);
    if (erstes) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${erstes}"]`)?.focus());
    }
  }

  if (zustand.art === "gesendet") {
    const g = t.gesendet;
    return (
      <div className="card card--pad stack" role="status">
        <span className="tag tag--mint">{g.tag}</span>
        <h2 ref={erfolgRef} tabIndex={-1} style={{ fontSize: "var(--text-2xl)" }}>{g.titel(f.vorname.trim().split(/\s+/)[0] ?? "")}</h2>
        <p>{g.text}</p>
        <p className="small muted">{g.klein}</p>
        <div className="btn-row">
          <Link href={pfad(lang, "/wissen")} className="btn btn--primary">{t.weiterWissen}</Link>
          <Link href={pfad(lang, "/rechner")} className="btn btn--ghost">{texte(lang).allgemein.zumRechner}</Link>
        </div>
      </div>
    );
  }

  if (zustand.art === "email") {
    const m = t.perEmail;
    return (
      <div className="card card--pad stack" role="status">
        <span className="tag tag--mint">{m.tag}</span>
        <h2 style={{ fontSize: "var(--text-2xl)" }}>{m.titel}</h2>
        <p>{m.text(site.betreiber.email)}</p>
        <p className="small muted">
          {m.ohne(site.betreiber.email)} <a href={`mailto:${site.betreiber.email}`}>{site.betreiber.email}</a>
        </p>
        <div className="btn-row">
          <Link href={pfad(lang, "/wissen")} className="btn btn--primary">{t.weiterWissen}</Link>
          <Link href={pfad(lang, "/rechner")} className="btn btn--ghost">{texte(lang).allgemein.zumRechner}</Link>
        </div>
      </div>
    );
  }

  if (zustand.art === "erfolg") {
    const { antwort } = zustand;
    const e = t.erfolg[antwort.uebermittlung];
    const name = antwort.uebermittlung === "nicht_vorgesehen" ? site.name : antwort.empfaengerName;
    const warnung = antwort.uebermittlung === "fehlgeschlagen" || antwort.uebermittlung === "ausstehend";
    return (
      <div className="card card--pad stack" role="status">
        <span className={`tag ${warnung ? "tag--gold" : "tag--mint"}`}>{antwort.duplikat ? t.duplikatTag : t.erfolgTag}</span>
        <h2 ref={erfolgRef} tabIndex={-1} style={{ fontSize: "var(--text-2xl)" }}>{e.titel}</h2>
        <p>{e.text(name)}</p>
        {antwort.duplikat && <p className="small muted">{t.duplikat}</p>}
        <p className="small muted">
          {t.vorgang}: <span className="num">{antwort.leadId.slice(0, 8)}</span>. {t.loeschen}{" "}
          <Link href={pfad(lang, "/datenschutz")}>{t.boxDatenschutz}</Link>.
        </p>
        <div className="btn-row">
          <Link href={pfad(lang, "/wissen")} className="btn btn--primary">{t.weiterWissen}</Link>
          <Link href={pfad(lang, "/rechner")} className="btn btn--ghost">{texte(lang).allgemein.zumRechner}</Link>
        </div>
      </div>
    );
  }

  const fehlerListe = REIHENFOLGE.filter((k) => fehler[k]);
  const sendet = zustand.art === "sendet";
  const feld = (k: keyof Feldfehler) => ({
    "aria-invalid": fehler[k] ? (true as const) : undefined,
    "aria-describedby": fehler[k] ? `${k}-fehler` : undefined,
  });
  const meldung = (k: keyof Feldfehler) => fehler[k] && <p className="error" id={`${k}-fehler`}>{fehler[k]}</p>;
  const z = t.quali;

  return (
    <form ref={formRef} className="form card card--pad" onSubmit={absenden} noValidate aria-busy={sendet}>
      {fehlerListe.length > 0 && (
        <div className="note note--danger" role="alert">
          <h4>{fehlerListe.length === 1 ? t.fehlerEins : t.fehlerMehr(fehlerListe.length)}</h4>
          <ul style={{ paddingLeft: "1.1rem" }}>{fehlerListe.map((k) => <li key={k}>{fehler[k]}</li>)}</ul>
        </div>
      )}
      {zustand.art === "fehler" && (
        <div className="note note--danger" role="alert">
          <h4>{t.nichtGesendet}</h4>
          <p>{zustand.meldung}</p>
        </div>
      )}

      {/* 1 · Das Anliegen steht an erster Stelle */}
      <Abschnitt nr={1} titel={z.ziel}>
        <Knoepfe name="ziel" frage={z.ziel} ohneLegende untereinander werte={ZIELE} beschriftung={z.ziele} wert={q.ziel} onWahl={(v) => setzeQ("ziel", v)} />
        {meldung("ziel")}
        {q.ziel === "sonstiges" && (
          <div className="field">
            <label htmlFor="nachricht">{z.sonstigeFrage}</label>
            <textarea className="textarea" id="nachricht" name="nachricht" maxLength={1000} rows={3} required value={f.nachricht} onChange={(e) => setze("nachricht", e.target.value)} {...feld("nachricht")} />
            {meldung("nachricht")}
          </div>
        )}
      </Abschnitt>

      {/* 2 · Beruf – alles Weitere klärt der Berater im Gespräch */}
      <Abschnitt nr={2} titel={z.beruf}>
        <Knoepfe name="beruf" frage={z.beruf} ohneLegende werte={BERUFE} beschriftung={z.berufe} wert={q.beruf} onWahl={(v) => setzeQ("beruf", v)} />
        {meldung("beruf")}
        {rechner && (
          <div className={`rechner-uebernahme ${rechnerMit ? "" : "rechner-uebernahme--aus"}`}>
            <p><strong>{z.rechnerTitel}:</strong> {rechnerMit ? rechnerText(rechner) : z.rechnerAus}</p>
            <button type="button" className="link-knopf" onClick={() => setRechnerMit((x) => !x)}>
              {rechnerMit ? z.rechnerWeg : z.rechnerDoch}
            </button>
          </div>
        )}
      </Abschnitt>

      {/* 3 · Kontakt */}
      <Abschnitt nr={3} titel={z.abschnitte[1]!.titel}>
        <div className="form-row form-row--2">
          <div className="field">
            <label htmlFor="vorname">{t.name}</label>
            <input className="input" id="vorname" name="vorname" autoComplete="name" required value={f.vorname} onChange={(e) => setze("vorname", e.target.value)} {...feld("vorname")} />
            {meldung("vorname")}
            {meldung("nachname")}
          </div>
          <div className="field">
            <label htmlFor="telefon">{t.telefon}</label>
            <input className="input" id="telefon" name="telefon" type="tel" inputMode="tel" autoComplete="tel" required value={f.telefon} onChange={(e) => setze("telefon", e.target.value)} {...feld("telefon")} />
            {meldung("telefon")}
          </div>
        </div>
        <div className="form-row form-row--2">
          <div className="field">
            <label htmlFor="email">{t.email}</label>
            <input className="input" id="email" name="email" type="email" inputMode="email" autoComplete="email" required value={f.email} onChange={(e) => setze("email", e.target.value)} {...feld("email")} />
            {meldung("email")}
          </div>
          <div className="field">
            <label htmlFor="plz">{t.plz}</label>
            <input className="input" id="plz" name="plz" inputMode="numeric" autoComplete="postal-code" maxLength={5} required value={f.plz} onChange={(e) => setze("plz", e.target.value.replace(/\D/g, ""))} {...feld("plz")} />
            {meldung("plz")}
          </div>
        </div>
      </Abschnitt>

      <div className="field">
        <label className="choice" style={{ borderColor: fehler.einwilligung ? "var(--danger-700)" : undefined }}>
          <input type="checkbox" name="einwilligung" checked={f.einwilligung} onChange={(e) => setze("einwilligung", e.target.checked)} {...feld("einwilligung")} />
          <span>{einwilligungstext(f.empfaengerId, lang)}</span>
        </label>
        <p className="field__hint">
          <Link href={`${pfad(lang, "/partner")}#partnerliste`}>{t.partnerliste}</Link> ·{" "}
          <Link href={pfad(lang, "/datenschutz")}>{texte(lang).footer.links.datenschutz}</Link>
        </p>
        {meldung("einwilligung")}
      </div>

      {/* Honeypot gegen automatisierte Einsendungen – für Menschen unsichtbar. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">{t.honeypot}</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setze("website", e.target.value)} />
      </div>

      <div className="btn-row">
        <button type="submit" className="btn btn--primary btn--gross" disabled={sendet}>{sendet ? t.sendet : t.senden}</button>
      </div>
      <ul className="vertrauen">{t.vertrauen.map((x) => <li key={x}>{x}</li>)}</ul>
    </form>
  );
}

/** Einfachauswahl als Knöpfe (für kurze Antworten wie Beträge oder Beruf). */
function Knoepfe<T extends string>({
  name, frage, werte, beschriftung, wert, onWahl, optional, hinweis, ohneLegende = false, untereinander = false,
}: {
  name: string; frage: string; werte: readonly T[]; beschriftung: Record<T, string>; wert: T | undefined;
  onWahl: (v: T) => void; optional?: string; hinweis?: string;
  /** Die Frage steht schon als Abschnittstitel – dann nur für Screenreader wiederholen. */
  ohneLegende?: boolean;
  /** Antworten untereinander statt nebeneinander. */
  untereinander?: boolean;
}) {
  return (
    <fieldset className="knoepfe" id={name}>
      <legend className={ohneLegende ? "sr-only" : undefined}>{frage} {optional && <span className="optional">{optional}</span>}</legend>
      <div className={`knoepfe__liste ${untereinander ? "knoepfe__liste--spalte" : ""}`} role="radiogroup" aria-label={frage}>
        {werte.map((v) => (
          <button key={v} type="button" role="radio" name={name} className="chip" aria-checked={wert === v} onClick={() => onWahl(v)}>
            {beschriftung[v]}
          </button>
        ))}
      </div>
      {hinweis && <p className="field__hint">{hinweis}</p>}
    </fieldset>
  );
}

/** Nummerierter Abschnitt mit Titel. */
function Abschnitt({ nr, titel, children }: { nr: number; titel: string; children: React.ReactNode }) {
  return (
    <section className="abschnitt" aria-labelledby={`abschnitt-${nr}`}>
      <div className="abschnitt__kopf">
        <span className="abschnitt__nr" aria-hidden="true">{nr}</span>
        <h3 id={`abschnitt-${nr}`}>{titel}</h3>
      </div>
      <div className="abschnitt__inhalt">{children}</div>
    </section>
  );
}
