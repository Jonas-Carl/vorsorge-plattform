"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { reform2027 } from "@/config/foerderung";
import { grenzen, szenarien } from "@/config/szenarien";
import { pfad, type Lang } from "@/i18n";
import { texte } from "@/i18n/texte";
import { track } from "@/lib/analytics";
import { berechneZulage } from "@/lib/foerderung";
import { euro, euroGenau, prozent } from "@/lib/format";
import { berechne, bereinigeEingabe, standardEingabe, type RechnerEingabe } from "@/lib/rechner";
import { holeEingabe, merkeEingabe } from "@/lib/rechnerUebergabe";
import { FARBEN, GrowthChart } from "./GrowthChart";
import { Icon } from "./Icon";
import { NumberField } from "./NumberField";

const r = reform2027;

/**
 * Startwerte des einfachen Rechners. Er rechnet mit dem, was gesetzlich
 * feststeht: Zulagen nach §§ 84–86 EStG n. F. und Kosten in Höhe des
 * gesetzlichen Höchstwerts für das Standarddepot.
 */
const START: RechnerEingabe = {
  ...standardEingabe,
  kosten: r.produkt.effektivkostenStandarddepotMax,
  foerderung: { aktiv: true, kinder: 0, kindergeldJahre: grenzen.kindergeldJahre.start },
};

const SCHNELLWAHL = [25, 50, 100, 150];
const MAX_KINDER_EINFACH = 5;

export function Calculator({ lang, kompakt = false }: { lang: Lang; kompakt?: boolean }) {
  const t = texte(lang).rechner;
  const [roh, setRoh] = useState<RechnerEingabe>(() => ({ ...START, ...(kompakt ? null : holeEingabe()) }));
  const gestartet = useRef(false);

  const e = useMemo(() => bereinigeEingabe(roh), [roh]);
  const ergebnis = useMemo(() => berechne(e), [e]);

  function setze(teil: Partial<RechnerEingabe>) {
    if (!gestartet.current) {
      gestartet.current = true;
      track("rechner_gestartet");
    }
    setRoh((alt) => ({ ...alt, ...teil }));
  }
  const setzeFoerderung = (teil: Partial<RechnerEingabe["foerderung"]>) =>
    setze({ foerderung: { ...roh.foerderung, ...teil } });

  const E = (x: number) => euro(x, lang);
  const P = (x: number) => prozent(x, 2, lang);

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

  return (
    <div className={`rechner ${kompakt ? "rechner--kompakt" : ""}`}>
      {/* ------------------------------ Drei Fragen ------------------------------ */}
      <form className="rechner__fragen" onSubmit={(ev) => ev.preventDefault()} noValidate>
        <NumberField
          id="alter" gross lang={lang} label={t.alter} unit={t.alterEinheit} sliderLabel={t.regler}
          value={roh.alter} min={grenzen.alter.min} max={grenzen.alter.max} step={1}
          onChange={(alter) => setze({ alter })}
        />

        <div>
          <NumberField
            id="sparrate" gross lang={lang} label={t.sparrate} unit="€" sliderLabel={t.regler}
            value={roh.sparrate} min={grenzen.sparrate.min} max={300} step={grenzen.sparrate.schritt}
            onChange={(sparrate) => setze({ sparrate })}
          />
          <div className="chips" role="group" aria-label={t.sparrate}>
            {SCHNELLWAHL.map((betrag) => (
              <button
                key={betrag}
                type="button"
                className="chip"
                aria-pressed={e.sparrate === betrag}
                onClick={() => setze({ sparrate: betrag })}
              >
                {E(betrag)}
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
      </form>

      {/* ------------------------------ Ergebnis ------------------------------ */}
      <div className="rechner__ergebnis" aria-live="polite">
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
            </p>
          )}
          {eigenJahr > r.einzahlungsgrenzeJahr && <p className="note note--gold" role="status">{t.ueberGrenze}</p>}

          <div className="bis">
            <p className="bis__titel">{t.bisRente(e.rentenalter)}</p>
            <div className="balken" aria-hidden="true">
              <span style={{ width: `${(eigenGesamt / Math.max(eigenGesamt + ergebnis.zulagen, 1)) * 100}%`, background: FARBEN.einzahlung }} />
              <span style={{ width: `${(ergebnis.zulagen / Math.max(eigenGesamt + ergebnis.zulagen, 1)) * 100}%`, background: FARBEN.zulage }} />
            </div>
            <ul className="werte">
              <li><i style={{ background: FARBEN.einzahlung }} />{t.vonDir} <b>{E(eigenGesamt)}</b></li>
              {mitZulagen && <li><i style={{ background: FARBEN.zulage }} />{t.vomStaat} <b>{E(ergebnis.zulagen)}</b></li>}
            </ul>
          </div>
          {e.foerderung.aktiv && <p className="block__klein">{t.festHinweis}</p>}
        </section>

        {/* Das weiß niemand vorher */}
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

          <p className="block__text">{t.erklaerung}</p>
          <p className="block__klein">
            {t.kosten(P(e.kosten))}
            {Math.abs(e.kosten - r.produkt.effektivkostenStandarddepotMax) < 1e-9 && <> {t.kostenGesetz}</>}
            {mitInflation && <> {t.kaufkraft(E(ergebnis.endkapitalReal), P(e.inflation))}</>}
          </p>
        </section>

        {kompakt ? (
          <Link
            href={pfad(lang, "/rechner")}
            className="btn btn--ghost rechner__mehr"
            onClick={() => merkeEingabe({ alter: e.alter, sparrate: e.sparrate, rendite: e.rendite, foerderung: e.foerderung })}
          >
            {t.vollerRechner} <Icon name="arrow" size={18} />
          </Link>
        ) : (
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

            <details className="card card--pad disclosure disclosure--karte">
              <summary>
                <span>
                  <b>{t.mehrTitel}</b>
                  <small>{t.mehrText}</small>
                </span>
              </summary>
              <div className="disclosure__body mehr-grid">
                <NumberField
                  id="rentenalter" lang={lang} label={t.rentenalter} unit={t.alterEinheit} sliderLabel={t.regler}
                  value={e.rentenalter} min={grenzen.rentenalter.min} max={grenzen.rentenalter.max} step={1}
                  onChange={(rentenalter) => setze({ rentenalter })}
                />
                <NumberField
                  id="startkapital" lang={lang} label={t.startkapital} unit="€" sliderLabel={t.regler}
                  value={roh.startkapital} min={grenzen.startkapital.min} max={grenzen.startkapital.max} step={grenzen.startkapital.schritt}
                  onChange={(startkapital) => setze({ startkapital })}
                />
                <NumberField
                  id="rendite" lang={lang} label={t.rendite} unit="%" scale={100} decimals={2} sliderLabel={t.regler}
                  value={roh.rendite} min={grenzen.rendite.min} max={grenzen.rendite.max} step={grenzen.rendite.schritt}
                  hint={t.renditeHinweis}
                  onChange={(rendite) => setze({ rendite })}
                />
                <NumberField
                  id="kosten" lang={lang} label={t.kostenFeld} unit="%" scale={100} decimals={2} sliderLabel={t.regler}
                  value={roh.kosten} min={grenzen.kosten.min} max={grenzen.kosten.max} step={grenzen.kosten.schritt}
                  onChange={(kosten) => setze({ kosten })}
                />
                <NumberField
                  id="dynamik" lang={lang} label={t.dynamik} unit="%" scale={100} decimals={1} sliderLabel={t.regler}
                  value={roh.dynamik} min={grenzen.dynamik.min} max={grenzen.dynamik.max} step={grenzen.dynamik.schritt}
                  onChange={(dynamik) => setze({ dynamik })}
                />
                <NumberField
                  id="inflation" lang={lang} label={t.inflation} unit="%" scale={100} decimals={2} sliderLabel={t.regler}
                  value={roh.inflation} min={grenzen.inflation.min} max={grenzen.inflation.max} step={grenzen.inflation.schritt}
                  onChange={(inflation) => setze({ inflation })}
                />
                {e.foerderung.kinder > 0 && (
                  <NumberField
                    id="kindergeldjahre" lang={lang} label={t.kindergeldJahre} unit={t.alterEinheit} sliderLabel={t.regler}
                    value={roh.foerderung.kindergeldJahre} min={grenzen.kindergeldJahre.min} max={grenzen.kindergeldJahre.max} step={1}
                    onChange={(kindergeldJahre) => setzeFoerderung({ kindergeldJahre })}
                  />
                )}
                <label className="switch">
                  <input type="checkbox" role="switch" checked={roh.foerderung.aktiv} onChange={(ev) => setzeFoerderung({ aktiv: ev.target.checked })} />
                  <span><strong>{t.zuschussAn}</strong><br />{t.zuschussText}</span>
                </label>
              </div>
              <div className="btn-row" style={{ marginTop: "var(--s-5)" }}>
                <button type="button" className="btn btn--ghost" onClick={() => setRoh(START)}>{t.zuruecksetzen}</button>
              </div>
              <p className="small muted" style={{ marginTop: "var(--s-4)" }}>
                {t.nichtDrin} <Link href={pfad(lang, "/quellen-methodik")}>{t.methodik}</Link>
              </p>
            </details>

            <aside className="cta-quiet" aria-labelledby="cta-rechner">
              <div className="stack">
                <h3 id="cta-rechner">{t.ctaTitel}</h3>
                <p className="small">{t.ctaText}</p>
              </div>
              <Link href={pfad(lang, "/anfrage")} className="btn btn--primary" onClick={() => track("anfrage_begonnen", { herkunft: "rechner" })}>
                {t.ctaKnopf}
              </Link>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
