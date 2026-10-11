"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { aktivePartner, EMPFAENGER_PLATTFORM } from "@/config/partner";
import { site } from "@/config/site";
import { pfad, type Lang } from "@/i18n";
import { texte } from "@/i18n/texte";
import { merkeAttribution, track } from "@/lib/analytics";
import type { Anliegen, Feldfehler, Kontaktzeit, LeadAntwort } from "@/lib/leads/types";
import { ANLIEGEN, einwilligungstext, empfaengerName, KONTAKTZEITEN, pruefeAnfrage } from "@/lib/leads/validation";

type Felder = {
  vorname: string; nachname: string; email: string; telefon: string;
  kontaktweg: "email" | "telefon"; kontaktzeit: Kontaktzeit; anliegen: Anliegen; nachricht: string;
  empfaengerId: string; einwilligung: boolean; website: string;
};

const LEER: Felder = {
  vorname: "", nachname: "", email: "", telefon: "", kontaktweg: "email", kontaktzeit: "egal",
  anliegen: "allgemein", nachricht: "", empfaengerId: "", einwilligung: false, website: "",
};

type Zustand =
  | { art: "bereit" }
  | { art: "sendet" }
  | { art: "erfolg"; antwort: Extract<LeadAntwort, { ok: true }> }
  | { art: "fehler"; meldung: string };

const jetzt = () => Date.now();

/** Statische Vorschau (GitHub Pages): Es gibt keinen Server, der Fragen annehmen könnte. */
const VORSCHAU = process.env.NEXT_PUBLIC_DEMO === "1";
const VORSCHAU_TEXT = {
  de: "Das ist nur eine Vorschau der Seite. Hier kann noch nichts abgeschickt werden. Deine Angaben wurden nicht gespeichert und nicht übertragen.",
  en: "This is only a preview of the site. Nothing can be sent here yet. Your details were not saved and not transmitted.",
} as const;

const REIHENFOLGE: (keyof Feldfehler)[] = [
  "vorname", "nachname", "email", "kontaktweg", "telefon", "kontaktzeit", "anliegen", "nachricht", "empfaengerId", "einwilligung",
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
} as const;

export function LeadForm({ lang }: { lang: Lang }) {
  const t = texte(lang).anfrage;
  const partnerListe = aktivePartner();
  const nurPlattform = partnerListe.length === 0;

  const [f, setF] = useState<Felder>({ ...LEER, empfaengerId: nurPlattform ? EMPFAENGER_PLATTFORM : "" });
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
  }, []);

  useEffect(() => {
    if (zustand.art === "erfolg") erfolgRef.current?.focus();
  }, [zustand.art]);

  const setze = <K extends keyof Felder>(k: K, v: Felder[K]) => {
    setF((alt) => ({
      ...alt,
      [k]: v,
      // Eine Bestätigung gilt nur für den Empfänger, für den sie gegeben wurde.
      ...(k === "empfaengerId" ? { einwilligung: false } : {}),
    }));
    if (fehler[k as keyof Feldfehler]) setFehler((alt) => ({ ...alt, [k]: undefined }));
  };

  const empfaenger = f.empfaengerId ? empfaengerName(f.empfaengerId) : null;
  const anPartner = f.empfaengerId !== "" && f.empfaengerId !== EMPFAENGER_PLATTFORM;

  async function absenden(ev: React.FormEvent) {
    ev.preventDefault();
    if (zustand.art === "sendet") return;

    const anfrage = {
      ...f,
      telefon: f.telefon || undefined,
      nachricht: f.nachricht || undefined,
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

    setZustand({ art: "sendet" });
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anfrage),
      });
      const antwort = (await res.json()) as LeadAntwort;
      if (antwort.ok) {
        track("anfrage_abgeschickt", { partner: anPartner });
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
  const weg = f.kontaktweg === "telefon" ? t.perTelefon : t.perMail;

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

      <div className="form-row form-row--2">
        <div className="field">
          <label htmlFor="vorname">{t.vorname}</label>
          <input className="input" id="vorname" name="vorname" autoComplete="given-name" required value={f.vorname} onChange={(e) => setze("vorname", e.target.value)} {...feld("vorname")} />
          {meldung("vorname")}
        </div>
        <div className="field">
          <label htmlFor="nachname">{t.nachname}</label>
          <input className="input" id="nachname" name="nachname" autoComplete="family-name" required value={f.nachname} onChange={(e) => setze("nachname", e.target.value)} {...feld("nachname")} />
          {meldung("nachname")}
        </div>
      </div>

      <div className="field">
        <label htmlFor="email">{t.email}</label>
        <input className="input" id="email" name="email" type="email" inputMode="email" autoComplete="email" required value={f.email} onChange={(e) => setze("email", e.target.value)} {...feld("email")} />
        {meldung("email")}
      </div>

      <fieldset className="radio-group">
        <legend>{t.wie}</legend>
        <div className="form-row form-row--2">
          {(["email", "telefon"] as const).map((k) => (
            <label key={k} className="choice">
              <input type="radio" name="kontaktweg" value={k} checked={f.kontaktweg === k} onChange={() => setze("kontaktweg", k)} />
              <span>{k === "email" ? t.perMail : t.perTelefon}</span>
            </label>
          ))}
        </div>
        {meldung("kontaktweg")}
      </fieldset>

      {f.kontaktweg === "telefon" && (
        <div className="form-row form-row--2">
          <div className="field">
            <label htmlFor="telefon">{t.telefon}</label>
            <input className="input" id="telefon" name="telefon" type="tel" inputMode="tel" autoComplete="tel" value={f.telefon} onChange={(e) => setze("telefon", e.target.value)} {...feld("telefon")} />
            {meldung("telefon")}
          </div>
          <div className="field">
            <label htmlFor="kontaktzeit">{t.zeit}</label>
            <select className="select" id="kontaktzeit" name="kontaktzeit" value={f.kontaktzeit} onChange={(e) => setze("kontaktzeit", e.target.value as Kontaktzeit)}>
              {KONTAKTZEITEN.map((k) => <option key={k} value={k}>{t.zeiten[k]}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="anliegen">{t.worum}</label>
        <select className="select" id="anliegen" name="anliegen" value={f.anliegen} onChange={(e) => setze("anliegen", e.target.value as Anliegen)} {...feld("anliegen")}>
          {ANLIEGEN.map((a) => <option key={a} value={a}>{t.themen[a]}</option>)}
        </select>
        {meldung("anliegen")}
      </div>

      <div className="field">
        <label htmlFor="nachricht">{t.nachricht} <span className="optional">{t.optional}</span></label>
        <textarea className="textarea" id="nachricht" name="nachricht" maxLength={1000} value={f.nachricht} onChange={(e) => setze("nachricht", e.target.value)} aria-describedby="nachricht-hinweis" />
        <p className="field__hint" id="nachricht-hinweis">{t.nachrichtHinweis}</p>
      </div>

      <fieldset className="radio-group">
        <legend>{t.anWen}</legend>
        <label className="choice">
          <input type="radio" name="empfaengerId" value={EMPFAENGER_PLATTFORM} checked={f.empfaengerId === EMPFAENGER_PLATTFORM} onChange={() => setze("empfaengerId", EMPFAENGER_PLATTFORM)} />
          <span>
            {site.name}
            <small>{t.plattformText}</small>
          </span>
        </label>
        {partnerListe.map((p) => (
          <label key={p.id} className="choice">
            <input type="radio" name="empfaengerId" value={p.id} checked={f.empfaengerId === p.id} onChange={() => setze("empfaengerId", p.id)} />
            <span>
              {p.name}
              <small>{p.beschreibung} {p.transparenzhinweis}</small>
            </span>
          </label>
        ))}
        {nurPlattform && (
          <p className="field__hint">
            {t.keinePartner} <Link href={pfad(lang, "/partner")}>{t.partnerMehr}</Link>
          </p>
        )}
        {meldung("empfaengerId")}
      </fieldset>

      {empfaenger && (
        <div className="summary-box" aria-live="polite">
          <strong>{t.boxTitel}</strong>
          <dl>
            <dt>{t.boxEmpfaenger}</dt>
            <dd>{empfaenger}{!anPartner && <> – {t.plattformText}</>}</dd>
            <dt>{t.boxDaten}</dt>
            <dd>
              {t.boxDatenBasis}{f.kontaktweg === "telefon" ? t.boxDatenTel : ""}{t.boxDatenThema}
              {f.nachricht.trim() ? t.boxDatenNachricht : ""}{t.boxDatenRechner}
            </dd>
            <dt>{t.boxWozu}</dt>
            <dd>{t.boxWozuText}{anPartner ? t.boxWozuPartner : ""}</dd>
            <dt>{t.boxDanach}</dt>
            <dd>{t.boxDanachText(weg.replace(/^(Per|By) /, ""))}</dd>
            <dt>{t.boxDatenschutz}</dt>
            <dd>
              <Link href={pfad(lang, "/datenschutz")}>{texte(lang).footer.links.datenschutz}</Link>
              {anPartner && <> · <Link href={pfad(lang, "/transparenz")}>{texte(lang).footer.links.transparenz}</Link></>}
            </dd>
          </dl>
        </div>
      )}

      <div className="field">
        <label className="choice" style={{ borderColor: fehler.einwilligung ? "var(--danger-700)" : undefined }}>
          <input type="checkbox" name="einwilligung" checked={f.einwilligung} disabled={!empfaenger} onChange={(e) => setze("einwilligung", e.target.checked)} {...feld("einwilligung")} />
          <span>{f.empfaengerId ? einwilligungstext(f.empfaengerId, lang) : t.erstWaehlen}</span>
        </label>
        {meldung("einwilligung")}
      </div>

      {/* Honeypot gegen automatisierte Einsendungen – für Menschen unsichtbar. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="website">{t.honeypot}</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setze("website", e.target.value)} />
      </div>

      <div className="btn-row">
        <button type="submit" className="btn btn--primary" disabled={sendet}>{sendet ? t.sendet : t.senden}</button>
        <span className="small muted">{t.kostenlos}</span>
      </div>
    </form>
  );
}
