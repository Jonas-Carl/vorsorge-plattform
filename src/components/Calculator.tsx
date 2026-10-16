"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { reform2027 } from "@/config/foerderung";
import { grenzen, szenarien } from "@/config/szenarien";
import { pfad, type Lang } from "@/i18n";
import { texte } from "@/i18n/texte";
import { track } from "@/lib/analytics";
import { berechneZulage } from "@/lib/foerderung";
import { euro, euroGenau, prozent } from "@/lib/format";
import { berechne, bereinigeEingabe, monatlicheAuszahlung, type RechnerEingabe } from "@/lib/rechner";
import { holeEingabe } from "@/lib/rechnerUebergabe";
import { EINFACHE_STARTWERTE } from "@/lib/startwerte";
import { FARBEN, GrowthChart } from "./GrowthChart";
import { Icon } from "./Icon";
import { NumberField } from "./NumberField";

const r = reform2027;

const START = EINFACHE_STARTWERTE;

/** Gesetzliche Marken für den Sparbetrag, auf den Monat umgerechnet. */
const MIN_MONAT = r.mindesteigenbeitrag / 12;
const VOLL_MONAT = r.grundzulage.stufe2.bis / 12;
const MAX_MONAT = r.einzahlungsgrenzeJahr / 12;
/** Der Regler endet hier, solange niemand das gesetzliche Maximum wählt. */
const REGLER_MAX = 300;
const PLAN_BIS = r.produkt.auszahlungsplanEndetFruehestensAlter;

const SCHNELLWAHL: { betrag: number; marke?: "min" | "voll" | "max" }[] = [
  { betrag: MIN_MONAT, marke: "min" },
  { betrag: 25 },
  { betrag: 50 },
  { betrag: 100 },
  { betrag: VOLL_MONAT, marke: "voll" },
  { betrag: MAX_MONAT, marke: "max" },
];
const BEISPIELE = [
  { id: "azubi", alter: 17, sparrate: 25, kinder: 0 },
  { id: "start", alter: 24, sparrate: 50, kinder: 0 },
  { id: "familie", alter: 35, sparrate: 50, kinder: 2 },
  { id: "selbst", alter: 40, sparrate: 150, kinder: 0 },
  { id: "spaet", alter: 52, sparrate: 150, kinder: 0 },
] as const;
const MAX_KINDER_EINFACH = 5;
/** Dauer der Rechen-Anzeige: drei Schritte, die der Rechner tatsächlich ausführt. */
const RECHENDAUER_MS = 3000;
const RECHENDAUER_RUHIG_MS = 900;

type Phase = "eingabe" | "rechnet" | "fertig";

export function Calculator({ lang, kompakt = false }: { lang: Lang; kompakt?: boolean }) {
  const t = texte(lang).rechner;
  const n = texte(lang).neu;
  const b = texte(lang).berechnen;
  // Werte, die der Kurzrechner der Startseite mitgegeben hat: dann ist schon gerechnet.
  const [uebergeben] = useState(() => (kompakt ? null : holeEingabe()));
  const [roh, setRoh] = useState<RechnerEingabe>(() => ({ ...START, ...uebergeben }));
  const [phase, setPhase] = useState<Phase>(uebergeben ? "fertig" : "eingabe");
  const [schritt, setSchritt] = useState(0);
  const uhren = useRef<number[]>([]);
  const ergebnisRef = useRef<HTMLDivElement>(null);
  // Einstellungen: am großen Bildschirm offen (rechts neben den Fragen), am Handy eingeklappt.
  const [mehrOffen, setMehrOffen] = useState(true);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.matchMedia("(max-width: 899px)").matches) setMehrOffen(false);
  }, []);
  useEffect(() => () => uhren.current.forEach((u) => window.clearTimeout(u)), []);
  const gestartet = useRef(false);
  // Bleibt an, damit der Regler beim Zurückziehen vom Maximum nicht springt.
  const [weiterRegler, setWeiterRegler] = useState(false);

  const e = useMemo(() => bereinigeEingabe(roh), [roh]);
  const ergebnis = useMemo(() => berechne(e), [e]);

  function setze(teil: Partial<RechnerEingabe>) {
    if (!gestartet.current) {
      gestartet.current = true;
      track("rechner_gestartet");
    }
    setRoh((alt) => ({ ...alt, ...teil }));
  }
  /**
   * „Jetzt berechnen“: zeigt kurz die drei Rechenschritte, dann das Ergebnis.
   * Danach rechnet der Rechner bei jeder Änderung wie gewohnt sofort neu.
   */
  function berechnenStarten() {
    uhren.current.forEach((u) => window.clearTimeout(u));
    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dauer = ruhig ? RECHENDAUER_RUHIG_MS : RECHENDAUER_MS;
    const anzahl = b.schritte.length;
    setPhase("rechnet");
    setSchritt(0);
    track("rechner_gestartet");
    ergebnisRef.current?.scrollIntoView({ behavior: ruhig ? "auto" : "smooth", block: "start" });
    uhren.current = [
      ...Array.from({ length: anzahl }, (_, i) => window.setTimeout(() => setSchritt(i + 1), ((i + 1) * dauer) / anzahl - 120)),
      window.setTimeout(() => {
        setPhase("fertig");
        track("rechner_ergebnis_gesehen");
      }, dauer),
    ];
  }

  const setzeFoerderung = (teil: Partial<RechnerEingabe["foerderung"]>) =>
    setze({ foerderung: { ...roh.foerderung, ...teil } });

  // Spätere Erhöhungen des Sparbetrags: ab einem Alter ein neuer Monatsbetrag.
  const stufen = roh.erhoehungen ?? [];
  const setzeStufen = (liste: NonNullable<RechnerEingabe["erhoehungen"]>) => setze({ erhoehungen: liste });
  function stufeDazu() {
    const vorher = stufen[stufen.length - 1];
    const abAlter = Math.min(grenzen.erhoehungen.abAlterMax, Math.max(e.alter + 1, (vorher?.abAlter ?? e.alter) + 5));
    const sparrate = Math.min(grenzen.sparrate.max, (vorher?.sparrate ?? e.sparrate) + 50);
    setzeStufen([...stufen, { abAlter, sparrate }]);
  }

  // Geplante Kinder: je Kind das eigene Alter bei der Geburt.
  const geplant = roh.foerderung.geplanteKinder ?? [];
  const setzeGeplant = (liste: number[]) => setzeFoerderung({ geplanteKinder: liste });
  function geplantDazu() {
    const vorher = geplant[geplant.length - 1] ?? e.alter;
    setzeGeplant([...geplant, Math.min(grenzen.geburtsalter.max, Math.max(grenzen.geburtsalter.min, vorher + 2))]);
  }

  const E = (x: number) => euro(x, lang);
  const P = (x: number) => prozent(x, 2, lang);

  // Für den Hinweis im Block „Das steht fest“: alle Erhöhungen, die in die Laufzeit fallen.
  const stufenListe = [...(e.erhoehungen ?? [])]
    .filter((s) => s.abAlter > e.alter && s.abAlter < e.rentenalter)
    .sort((a, b) => a.abAlter - b.abAlter)
    .map((s) => t.stufeEintrag(s.abAlter, E(s.sparrate)))
    .join(", ");

  // --- Das steht fest: Beitrag und Zuschuss pro Jahr -------------------------
  const eigenJahr = e.sparrate * 12;
  const kinderAktiv = e.foerderung.kindergeldJahre > 0 ? e.foerderung.kinder : 0;
  const zulage = berechneZulage({ eigenbeitragJahr: eigenJahr, kinder: kinderAktiv, berufseinsteigerbonus: false });
  const zuschussJahr = e.foerderung.aktiv ? zulage.gesamt : 0;
  const bonusMoeglich =
    e.foerderung.aktiv && zulage.mindesteigenbeitragErfuellt && e.alter < r.berufseinsteigerbonus.vorVollendungLebensjahr;
  const centProEuro = eigenJahr > 0 ? Math.round((zuschussJahr / eigenJahr) * 100) : 0;
  const eigenGesamt = ergebnis.einzahlungen + ergebnis.startkapital;

  // --- Aufteilung des Ergebnisses --------------------------------------------
  const wachstum = Math.max(ergebnis.wertzuwachs, 0);
  const summe = Math.max(eigenGesamt + ergebnis.zulagen + wachstum, 1);
  const anteil = (x: number) => `${(x / summe) * 100}%`;
  const stufe = szenarien.find((s) => Math.abs(s.renditePa - e.rendite) < 1e-9)?.id ?? null;
  const mitZulagen = ergebnis.zulagen > 0;
  const mitInflation = e.inflation > 0;
  const auszahlung = monatlicheAuszahlung(ergebnis.endkapital, e.rentenalter, PLAN_BIS);
  const reglerMax = weiterRegler || roh.sparrate > REGLER_MAX ? MAX_MONAT : REGLER_MAX;

  return (
    <div className={`rechner ${kompakt ? "rechner--kompakt" : ""}`}>
      {/* ------------------------------ Drei Fragen ------------------------------ */}
      <form className="rechner__fragen" onSubmit={(ev) => ev.preventDefault()} noValidate>
        {kompakt && (
          <div className="beispiele">
            <p className="beispiele__label" id="beispiele-label">{n.beispiele}</p>
            <div className="chips" role="group" aria-labelledby="beispiele-label">
              {BEISPIELE.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="chip chip--beispiel"
                  aria-pressed={e.alter === b.alter && e.sparrate === b.sparrate && e.foerderung.kinder === b.kinder}
                  onClick={() => setze({ alter: b.alter, sparrate: b.sparrate, foerderung: { ...roh.foerderung, kinder: b.kinder } })}
                >
                  {n.presets[b.id]}
                </button>
              ))}
            </div>
          </div>
        )}
        <NumberField
          id="alter" gross lang={lang} label={t.alter} unit={t.alterEinheit} sliderLabel={t.regler}
          value={roh.alter} min={grenzen.alter.min} max={grenzen.alter.max} step={1}
          onChange={(alter) => setze({ alter })}
        />
        {e.alter < 18 && <p className="note" role="status" style={{ marginTop: "calc(var(--s-4) * -1)" }}>{t.unter18}</p>}

        <div>
          <NumberField
            id="sparrate" gross lang={lang} label={t.sparrate} unit="€" sliderLabel={t.regler}
            value={roh.sparrate} min={grenzen.sparrate.min} max={MAX_MONAT} reglerMax={reglerMax} step={grenzen.sparrate.schritt}
            hint={t.sparrateHinweis} info={t.info.sparrate} infoLabel={t.infoZeigen}
            onChange={(sparrate) => setze({ sparrate })}
          />
          <div className="chips" role="group" aria-label={t.sparrate}>
            {SCHNELLWAHL.filter((s) => s.marke !== "min" && s.marke !== "max").map(({ betrag, marke }) => (
              <button
                key={betrag}
                type="button"
                className={`chip ${marke ? "chip--marke" : ""}`}
                aria-pressed={e.sparrate === betrag}
                onClick={() => {
                  if (betrag > REGLER_MAX) setWeiterRegler(true);
                  setze({ sparrate: betrag });
                }}
              >
                {E(betrag)}
                {marke && <small>{t.schnell[marke]}</small>}
              </button>
            ))}
          </div>
        </div>


        <div className="field field--gross">
          <div className="field__top">
            <span className="field__label" id="kinder-label">{t.kinder}</span>
            <div className="stepper" role="group" aria-labelledby="kinder-label">
              <button
                type="button"
                aria-label={t.weniger}
                disabled={e.foerderung.kinder <= 0}
                onClick={() => setzeFoerderung({ kinder: Math.max(0, e.foerderung.kinder - 1) })}
              >
                −
              </button>
              <output aria-live="polite">{e.foerderung.kinder}</output>
              <button
                type="button"
                aria-label={t.mehr}
                disabled={e.foerderung.kinder >= MAX_KINDER_EINFACH}
                onClick={() => setzeFoerderung({ kinder: Math.min(MAX_KINDER_EINFACH, e.foerderung.kinder + 1) })}
              >
                +
              </button>
            </div>
          </div>
          <p className="field__hint">{t.kinderHinweis}</p>
        </div>
        {/* Direkt unter der Kinderfrage, sobald mindestens ein Kind angegeben ist */}
        {e.foerderung.kinder > 0 && (
          <div className="kinder-zusatz">
            <NumberField
              id={`kindergeldjahre-${kompakt ? "k" : "v"}`} lang={lang} label={t.kindergeldJahre} unit={t.alterEinheit} sliderLabel={t.regler}
              value={roh.foerderung.kindergeldJahre} min={grenzen.kindergeldJahre.min} max={grenzen.kindergeldJahre.max} step={1}
              info={t.info.kindergeldJahre} infoLabel={t.infoZeigen}
              onChange={(kindergeldJahre) => setzeFoerderung({ kindergeldJahre })}
            />
          </div>
        )}

        {/* Geplante Kinder – direkt unter der Kinderfrage, jedes Kind als eigene Zeile */}
        <div className="plan plan--links" role="group" aria-labelledby={`geplant-label-${kompakt ? "k" : "v"}`}>
          <div className="plan__kopf">
            <span className="field__label" id={`geplant-label-${kompakt ? "k" : "v"}`}>{t.geplant}</span>
            <div className="stepper" role="group" aria-labelledby={`geplant-label-${kompakt ? "k" : "v"}`}>
              <button type="button" aria-label={t.weniger} disabled={geplant.length <= 0} onClick={() => setzeGeplant(geplant.slice(0, -1))}>−</button>
              <output aria-live="polite">{geplant.length}</output>
              <button type="button" aria-label={t.mehr} disabled={geplant.length >= grenzen.geplanteKinder.max} onClick={geplantDazu}>+</button>
            </div>
          </div>
          <p className="field__hint">{t.geplantHinweis}</p>
          {geplant.length > 0 && (
            <ol className="plan__liste">
              {geplant.map((g, i) => (
                <li key={i} className="plan__zeile plan__zeile--eine" role="group" aria-labelledby={`kind-titel-${kompakt ? "k" : "v"}-${i}`}>
                  <p className="plan__titel" id={`kind-titel-${kompakt ? "k" : "v"}-${i}`}>{t.kindTitel(i + 1)}</p>
                  <NumberField
                    id={`geplant-${kompakt ? "k" : "v"}-${i}`} lang={lang} label={t.kindAlter} unit={t.alterEinheit} regler={false}
                    value={g} min={grenzen.geburtsalter.min} max={grenzen.geburtsalter.max} step={grenzen.geburtsalter.schritt}
                    onChange={(alter) => setzeGeplant(geplant.map((x, k) => (k === i ? alter : x)))}
                  />
                </li>
              ))}
            </ol>
          )}
        </div>

      </form>

        <details
          className="card card--pad disclosure disclosure--karte rechner__einstellungen"
          open={mehrOffen}
          onToggle={(ev) => setMehrOffen(ev.currentTarget.open)}
        >
          <summary>
            <span>
              <b>{t.mehrTitel}</b>
              <small>{t.mehrText}</small>
            </span>
          </summary>
          <div className="disclosure__body mehr-grid">
              <div className="mehr-zusatz">
                {/* Gruppe 1: später mehr sparen – jede Erhöhung als eigene Zeile */}
                <div className="plan" role="group" aria-labelledby={`stufen-label-${kompakt ? "k" : "v"}`}>
                  <div className="plan__kopf">
                    <span className="field__label" id={`stufen-label-${kompakt ? "k" : "v"}`}>{t.mehrSparen}</span>
                    <div className="stepper" role="group" aria-labelledby={`stufen-label-${kompakt ? "k" : "v"}`}>
                      <button type="button" aria-label={t.weniger} disabled={stufen.length <= 0} onClick={() => setzeStufen(stufen.slice(0, -1))}>−</button>
                      <output aria-live="polite">{stufen.length}</output>
                      <button type="button" aria-label={t.mehr} disabled={stufen.length >= grenzen.erhoehungen.max} onClick={stufeDazu}>+</button>
                    </div>
                  </div>
                  <p className="field__hint">{t.mehrSparenHinweis}</p>
                  {stufen.length > 0 && (
                    <ol className="plan__liste">
                      {stufen.map((s, i) => (
                        <li key={i} className="plan__zeile" role="group" aria-labelledby={`stufe-titel-${kompakt ? "k" : "v"}-${i}`}>
                          <p className="plan__titel" id={`stufe-titel-${kompakt ? "k" : "v"}-${i}`}>{t.stufeTitel(i + 1)}</p>
                          <div className="plan__felder">
                            <NumberField
                              id={`stufe-ab-${kompakt ? "k" : "v"}-${i}`} lang={lang} label={t.stufeAb} unit={t.alterEinheit} regler={false}
                              value={s.abAlter} min={grenzen.erhoehungen.abAlterMin} max={grenzen.erhoehungen.abAlterMax} step={1}
                              onChange={(abAlter) => setzeStufen(stufen.map((x, k) => (k === i ? { ...x, abAlter } : x)))}
                            />
                            <NumberField
                              id={`stufe-rate-${kompakt ? "k" : "v"}-${i}`} lang={lang} label={t.stufeRate} unit="€" regler={false}
                              value={s.sparrate} min={0} max={MAX_MONAT} step={grenzen.sparrate.schritt}
                              onChange={(sparrate) => setzeStufen(stufen.map((x, k) => (k === i ? { ...x, sparrate } : x)))}
                            />
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

              </div>
            <NumberField
              id="rentenalter" lang={lang} label={t.rentenalter} unit={t.alterEinheit} sliderLabel={t.regler}
              value={e.rentenalter} min={grenzen.rentenalter.min} max={grenzen.rentenalter.max} step={1}
              info={t.info.rentenalter} infoLabel={t.infoZeigen}
              onChange={(rentenalter) => setze({ rentenalter })}
            />
            <NumberField
              id="startkapital" lang={lang} label={t.startkapital} unit="€" sliderLabel={t.regler}
              value={roh.startkapital} min={grenzen.startkapital.min} max={grenzen.startkapital.max} step={grenzen.startkapital.schritt}
              info={t.info.startkapital} infoLabel={t.infoZeigen}
              onChange={(startkapital) => setze({ startkapital })}
            />
            <NumberField
              id="rendite" lang={lang} label={t.rendite} unit="%" scale={100} decimals={2} sliderLabel={t.regler}
              value={roh.rendite} min={grenzen.rendite.min} max={grenzen.rendite.max} step={grenzen.rendite.schritt}
              info={t.renditeHinweis} infoLabel={t.infoZeigen}
              onChange={(rendite) => setze({ rendite })}
            />
            <NumberField
              id="kosten" lang={lang} label={t.kostenFeld} unit="%" scale={100} decimals={2} sliderLabel={t.regler}
              value={roh.kosten} min={grenzen.kosten.min} max={grenzen.kosten.max} step={grenzen.kosten.schritt}
              info={t.info.kosten} infoLabel={t.infoZeigen}
              onChange={(kosten) => setze({ kosten })}
            />
            <NumberField
              id="dynamik" lang={lang} label={t.dynamik} unit="%" scale={100} decimals={1} sliderLabel={t.regler}
              value={roh.dynamik} min={grenzen.dynamik.min} max={grenzen.dynamik.max} step={grenzen.dynamik.schritt}
              info={t.info.dynamik} infoLabel={t.infoZeigen}
              onChange={(dynamik) => setze({ dynamik })}
            />
            <NumberField
              id="inflation" lang={lang} label={t.inflation} unit="%" scale={100} decimals={2} sliderLabel={t.regler}
              value={roh.inflation} min={grenzen.inflation.min} max={grenzen.inflation.max} step={grenzen.inflation.schritt}
              hint={t.inflationHinweis} info={t.info.inflation} infoLabel={t.infoZeigen}
              onChange={(inflation) => setze({ inflation })}
            />
            <label className="switch">
              <input type="checkbox" role="switch" checked={roh.foerderung.aktiv} onChange={(ev) => setzeFoerderung({ aktiv: ev.target.checked })} />
              <span><strong>{t.zuschussAn}</strong><br />{t.zuschussText}</span>
            </label>
          </div>
          <div className="btn-row" style={{ marginTop: "var(--s-5)" }}>
            <button type="button" className="btn btn--ghost" onClick={() => { setRoh(START); setWeiterRegler(false); }}>{t.zuruecksetzen}</button>
          </div>
          <p className="small muted" style={{ marginTop: "var(--s-4)" }}>
            {t.nichtDrin} <Link href={pfad(lang, "/quellen-methodik")}>{t.methodik}</Link>
          </p>
        </details>

      <div className="berechnen rechner__knopfzeile">
        <button type="button" className="btn btn--primary btn--berechnen" onClick={berechnenStarten} disabled={phase === "rechnet"}>
          {phase === "fertig" ? b.neu : b.knopf} <Icon name="arrow" size={20} />
        </button>
        <p className="field__hint">{b.knopfHinweis}</p>
      </div>

      {/* ------------------------------ Ergebnis ------------------------------ */}
      <div className="rechner__ergebnis" aria-live="polite" ref={ergebnisRef}>
        {phase === "eingabe" ? null : phase === "rechnet" ? (
          <section className="berechnung berechnung--laeuft">
            <>
                <h3>{b.laeuftTitel}</h3>
                <div className="berechnung__balken" aria-hidden="true">
                  <span style={{ width: `${(schritt / b.schritte.length) * 100}%` }} />
                </div>
                <ol className="berechnung__schritte">
                  {b.schritte.map((text, i) => (
                    <li key={text} data-status={i < schritt ? "fertig" : i === schritt ? "aktiv" : "offen"}>{text}</li>
                  ))}
                </ol>
              </>
          </section>
        ) : (
        <>
        {/* Voraussichtlich (Beispiel, hängt vom Wachstum ab) */}
        <section className="block block--offen" aria-labelledby={`offen-${kompakt ? "k" : "v"}`}>
          <div className="block__kopf">
            <h3 id={`offen-${kompakt ? "k" : "v"}`}><Icon name="trend" size={20} /> {t.offenTitel}</h3>
            <span className="tag tag--hell">{t.offenTag}</span>
          </div>

          <p className="block__frage" id={`stufe-${kompakt ? "k" : "v"}`}>{t.wieStark}</p>
          <div className="stufen" role="group" aria-labelledby={`stufe-${kompakt ? "k" : "v"}`}>
            {szenarien.map((s) => (
              <button key={s.id} type="button" aria-pressed={stufe === s.id} onClick={() => setze({ rendite: s.renditePa })}>
                <b>{t.stufen[s.id]}</b>
                <span>{P(s.renditePa)} {t.proJahr}</span>
              </button>
            ))}
          </div>

          <p className="block__label">{t.ergebnis(e.rentenalter)}</p>
          <p className="block__zahl">{E(ergebnis.endkapital)}</p>
          <p className="block__risiko">{b.risiko}</p>

          <div className="balken balken--gross" aria-hidden="true">
            <span style={{ width: anteil(eigenGesamt), background: "#8fb0de" }} />
            <span style={{ width: anteil(ergebnis.zulagen), background: FARBEN.zulage }} />
            <span style={{ width: anteil(wachstum), background: FARBEN.zuwachs }} />
          </div>
          <ul className="werte werte--hell">
            <li><i style={{ background: "#8fb0de" }} />{t.vonDir} <b>{E(eigenGesamt)}</b></li>
            {mitZulagen && <li><i style={{ background: FARBEN.zulage }} />{t.vomStaat} <b>{E(ergebnis.zulagen)}</b></li>}
            <li><i style={{ background: FARBEN.zuwachs }} />{t.wachstum} <b>{E(ergebnis.wertzuwachs)}</b></li>
          </ul>

          {auszahlung > 0 && e.rentenalter < PLAN_BIS && (
            <div className="auszahlung">
              <p className="auszahlung__label">{t.auszahlung.label}</p>
              <p className="auszahlung__zahl">{E(auszahlung)} <span>{t.auszahlung.proMonat}</span></p>
              <p className="block__klein">{t.auszahlung.text(e.rentenalter, PLAN_BIS)}</p>
            </div>
          )}

        </section>

        {/* Rechte Spalte: was feststeht, darunter ruhig der nächste Schritt */}
        <div className="rechner__seite">
        {/* Das steht fest */}
        <section className="block block--fest" aria-labelledby={`fest-${kompakt ? "k" : "v"}`}>
          <div className="block__kopf">
            <h3 id={`fest-${kompakt ? "k" : "v"}`}><Icon name="check" size={20} /> {t.festTitel}</h3>
            <span className="tag tag--mint">{t.festTag}</span>
          </div>

          <div className="gleichung">
            <div className="gleichung__teil" style={{ ["--farbe" as string]: FARBEN.einzahlung }}>
              <span>{t.duJahr}</span>
              <b>{E(eigenJahr)}</b>
            </div>
            <span className="gleichung__zeichen" aria-hidden="true">+</span>
            <div className="gleichung__teil" style={{ ["--farbe" as string]: FARBEN.zulage }}>
              <span>{t.staatJahr}</span>
              <b>{E(zuschussJahr)}</b>
            </div>
            <span className="gleichung__zeichen" aria-hidden="true">=</span>
            <div className="gleichung__teil gleichung__teil--summe">
              <span>{t.zusammenJahr}</span>
              <b>{E(eigenJahr + zuschussJahr)}</b>
            </div>
          </div>

          {!e.foerderung.aktiv ? (
            <p className="block__text">{t.ohneZuschuss}</p>
          ) : !zulage.mindesteigenbeitragErfuellt ? (
            <p className="note note--gold" role="status">{t.unterMindest}</p>
          ) : (
            <p className="block__text">
              <strong>{t.proEuro(centProEuro >= 100 ? euroGenau(centProEuro / 100, lang) : `${centProEuro} ${t.cent}`)}</strong>
              {bonusMoeglich && <> {t.bonus(E(r.berufseinsteigerbonus.betrag))}</>}
              {kinderAktiv > 0 && <> {t.kinderJahre(Math.min(e.foerderung.kindergeldJahre, ergebnis.jahre))}</>}
              {(e.foerderung.geplanteKinder?.length ?? 0) > 0 && <> {t.geplantText(e.foerderung.geplanteKinder!.length)}</>}
              {stufenListe && <> {t.stufenText(stufenListe)}</>}
            </p>
          )}
          {eigenJahr > r.einzahlungsgrenzeJahr && <p className="note note--gold" role="status">{t.ueberGrenze}</p>}

          {e.foerderung.aktiv && (
            <details className="mini-info">
              <summary>{b.festKurz}</summary>
              <p className="block__klein">{t.festHinweis}</p>
            </details>
          )}
        </section>

            {/* Nächster Schritt: aus dem Beispiel einen Plan machen */}
            <div className="umsetzen umsetzen--seite" role="group" aria-labelledby={`umsetzen-${kompakt ? "k" : "v"}`}>
              <p className="umsetzen__eyebrow">{b.ctaEyebrow}</p>
              <h3 id={`umsetzen-${kompakt ? "k" : "v"}`}>{b.ctaTitel}</h3>
              <p className="umsetzen__text">{b.ctaText(E(e.sparrate))}</p>
              <ul className="umsetzen__liste">
                {b.ctaPunkte.map((punkt) => <li key={punkt}><Icon name="check" size={18} /> {punkt}</li>)}
              </ul>
              <div className="umsetzen__aktion">
                <Link href={pfad(lang, "/partner")} className="btn btn--umsetzen" onClick={() => track("anfrage_begonnen", { herkunft: "rechner-ergebnis" })}>
                  {b.ctaKnopf} <Icon name="arrow" size={18} />
                </Link>
              </div>
              <p className="umsetzen__netz">{b.ctaKlein} {n.beratungKlein}</p>
            </div>
        </div>

        {!kompakt && (
          <>
            <section className="card card--pad chart-card" aria-labelledby="verlauf-titel">
              <h3 id="verlauf-titel">{t.verlaufTitel}</h3>
              <GrowthChart
                verlauf={ergebnis.verlauf}
                zeigeReal={mitInflation}
                zeigeZulagen={mitZulagen}
                lang={lang}
                t={{
                  aria: t.chartAria(ergebnis.jahre, E(ergebnis.endkapital)),
                  hilfe: t.chartHilfe,
                  alter: t.chartAlter,
                  vonDir: t.vonDir,
                  vomStaat: t.vomStaat,
                  wachstum: t.wachstum,
                  kaufkraft: t.chartKaufkraft,
                  gesamt: t.tabWert,
                  jahreKurz: t.jahreKurz,
                }}
              />
              <details className="disclosure" onToggle={(ev) => ev.currentTarget.open && track("erklaerung_geoeffnet", { bereich: "tabelle" })}>
                <summary>{t.tabelle}</summary>
                <div className="table-wrap" style={{ marginTop: "1rem", maxHeight: "22rem", overflowY: "auto" }}>
                  <table className="num">
                    <thead>
                      <tr>
                        <th scope="col">{t.tabAlter}</th>
                        <th scope="col" className="num">{t.tabEingezahlt}</th>
                        {mitZulagen && <th scope="col" className="num">{t.tabStaat}</th>}
                        <th scope="col" className="num">{t.tabWert}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ergebnis.verlauf.map((p) => (
                        <tr key={p.jahr}>
                          <th scope="row">{p.alter}</th>
                          <td className="num">{E(p.eingezahlt)}</td>
                          {mitZulagen && <td className="num">{E(p.zulagen)}</td>}
                          <td className="num">{E(p.wert)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </section>


          </>
        )}
        </>
        )}
      </div>
    </div>
  );
}
