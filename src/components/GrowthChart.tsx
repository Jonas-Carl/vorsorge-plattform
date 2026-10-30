"use client";

import { useEffect, useRef, useState } from "react";
import { euro, euroKompakt, type Lang } from "@/lib/format";
import type { Jahreswert } from "@/lib/rechner";

const R = { o: 26, r: 12, u: 34, l: 74 };

export const FARBEN = {
  einzahlung: "#16335a",
  zulage: "#e0b04a",
  zuwachs: "#4fb9a3",
  real: "#9a7430",
} as const;

/** „Schöne“ Achsenobergrenze und Schrittweite für 4 Intervalle. */
function achse(max: number): { oben: number; schritt: number } {
  const roh = Math.max(max, 100) / 4;
  const potenz = Math.pow(10, Math.floor(Math.log10(roh)));
  const schritt = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((f) => f * potenz).find((s) => s >= roh) ?? roh;
  return { oben: schritt * 4, schritt };
}

export type ChartTexte = {
  aria: string;
  hilfe: string;
  alter: string;
  vonDir: string;
  vomStaat: string;
  wachstum: string;
  kaufkraft: string;
  gesamt: string;
  jahreKurz: string;
};

type Props = {
  verlauf: Jahreswert[]; zeigeReal: boolean; zeigeZulagen: boolean; lang: Lang; t: ChartTexte;
  /** false: Legende weglassen, wenn sie (mit Beträgen) außerhalb steht. */
  legende?: boolean;
  /** Feste Höhe in Pixeln (sonst abhängig von der Breite). */
  hoehe?: number;
  /** Optionale Vergleichslinie (Wert je Jahr), z. B. ein normales ETF-Depot. */
  vergleich?: { name: string; werte: number[] };
  /** false: den Hinweis „Tippe oder fahre …“ nicht anzeigen (Jahreswerte erscheinen trotzdem beim Zeigen). */
  hilfe?: boolean;
};

export function GrowthChart({ verlauf, zeigeReal, zeigeZulagen, lang, t, legende = true, hoehe, hilfe = true, vergleich }: Props) {
  const [aktiv, setAktiv] = useState<number | null>(null);
  // Das Diagramm zeichnet 1:1 in Pixeln, damit Beschriftungen auf jedem Gerät
  // gleich groß und lesbar bleiben.
  const rahmen = useRef<HTMLDivElement>(null);
  const [B, setB] = useState(720);
  useEffect(() => {
    const el = rahmen.current;
    if (!el) return;
    const beobachter = new ResizeObserver(([eintrag]) => {
      const breite = Math.round(eintrag?.contentRect.width ?? 0);
      if (breite > 0) setB(breite);
    });
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);
  // Auf dem Handy flacher, damit das Ergebnis nicht so viel Platz braucht.
  const H = hoehe ? (B < 480 ? Math.round(hoehe * 0.7) : hoehe) : Math.round(Math.min(340, Math.max(230, B * 0.5)));

  const n = verlauf.length - 1;
  const maxWert = Math.max(...verlauf.map((p) => Math.max(p.wert, p.eingezahlt + p.zulagen)), ...(vergleich?.werte ?? [0]));
  const { oben, schritt } = achse(maxWert);

  const x = (i: number) => R.l + (i / Math.max(n, 1)) * (B - R.l - R.r);
  const y = (v: number) => R.o + (1 - Math.max(v, 0) / oben) * (H - R.o - R.u);
  const linie = (f: (p: Jahreswert) => number) => verlauf.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(f(p)).toFixed(1)}`).join("");
  const flaeche = (f: (p: Jahreswert) => number) => `${linie(f)}L${x(n).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;

  // Auf schmalen Bildschirmen weniger Beschriftungen auf der Altersachse.
  const xSchritt = Math.max(1, Math.ceil(n / (B < 480 ? 3 : 6) / 5) * 5);
  const xTicks = verlauf.filter((p) => p.jahr === 0 || p.jahr === n || (p.jahr % xSchritt === 0 && n - p.jahr > xSchritt * 0.6));

  const punkt = aktiv === null ? null : verlauf[aktiv]!;
  const e = (v: number) => euro(v, lang);

  function aufZeiger(ev: React.PointerEvent<SVGSVGElement>) {
    const box = ev.currentTarget.getBoundingClientRect();
    const px = ((ev.clientX - box.left) / box.width) * B;
    const i = Math.round(((px - R.l) / (B - R.l - R.r)) * n);
    setAktiv(Math.min(n, Math.max(0, i)));
  }

  return (
    <figure style={{ margin: 0 }}>
      <div ref={rahmen}>
        <svg
          className="chart"
          viewBox={`0 0 ${B} ${H}`}
          role="img"
          aria-label={t.aria}
          onPointerMove={aufZeiger}
          onPointerDown={aufZeiger}
          onPointerLeave={() => setAktiv(null)}
          style={{ touchAction: "pan-y" }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line className="grid-line" x1={R.l} x2={B - R.r} y1={y(i * schritt)} y2={y(i * schritt)} />
              <text x={R.l - 10} y={y(i * schritt) + 4} textAnchor="end">{euroKompakt(i * schritt, lang)}</text>
            </g>
          ))}
          {xTicks.map((p) => (
            <text key={p.jahr} x={x(p.jahr)} y={H - 10} textAnchor={p.jahr === 0 ? "start" : p.jahr === n ? "end" : "middle"}>
              {p.alter}{t.jahreKurz ? ` ${t.jahreKurz}` : ""}
            </text>
          ))}

          <defs>
            <linearGradient id="verlauf-rendite" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5fd0b6" />
              <stop offset="100%" stopColor={FARBEN.zuwachs} stopOpacity={0.75} />
            </linearGradient>
            <linearGradient id="verlauf-staat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0c463" />
              <stop offset="100%" stopColor={FARBEN.zulage} />
            </linearGradient>
            <linearGradient id="verlauf-dir" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#24497a" />
              <stop offset="100%" stopColor={FARBEN.einzahlung} />
            </linearGradient>
          </defs>
          <path d={flaeche((p) => p.wert)} fill="url(#verlauf-rendite)" />
          {zeigeZulagen && <path d={flaeche((p) => Math.min(p.wert, p.eingezahlt + p.zulagen))} fill="url(#verlauf-staat)" />}
          <path d={flaeche((p) => Math.min(p.wert, p.eingezahlt))} fill="url(#verlauf-dir)" />
          <path d={linie((p) => p.wert)} fill="none" stroke="#12604f" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {zeigeReal && <path d={linie((p) => p.wertReal)} fill="none" stroke={FARBEN.real} strokeWidth={2} strokeDasharray="6 5" />}

          {vergleich && (
            <path
              className="chart__vergleich"
              d={vergleich.werte.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("")}
              fill="none" strokeWidth={2.5} strokeDasharray="7 5" strokeLinecap="round"
            />
          )}
          {/* Endwert dezent am letzten Punkt markieren */}
          {aktiv === null && n > 0 && (
            <g pointerEvents="none">
              <circle cx={x(n)} cy={y(verlauf[n]!.wert)} r={11} fill="#4fb9a3" opacity={0.25} />
              <circle cx={x(n)} cy={y(verlauf[n]!.wert)} r={5.5} fill="#fff" stroke="#12604f" strokeWidth={3} />
              <text className="chart__endwert" x={x(n) - 14} y={y(verlauf[n]!.wert) - 12} textAnchor="end">{e(verlauf[n]!.wert)}</text>
            </g>
          )}
          {punkt && aktiv !== null && (
            <g pointerEvents="none">
              <line x1={x(aktiv)} x2={x(aktiv)} y1={R.o} y2={y(0)} stroke="#12202e" strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={x(aktiv)} cy={y(punkt.wert)} r={5} fill="#fff" stroke="#17705f" strokeWidth={2} />
            </g>
          )}
        </svg>
      </div>

      <figcaption className="stack" style={{ marginTop: "0.75rem" }}>
        {legende && <ul className="legend">
          <li><i style={{ background: FARBEN.einzahlung }} /> {t.vonDir}</li>
          {zeigeZulagen && <li><i style={{ background: FARBEN.zulage }} /> {t.vomStaat}</li>}
          <li><i style={{ background: FARBEN.zuwachs }} /> {t.wachstum}</li>
          {zeigeReal && <li><i className="line" /> {t.kaufkraft}</li>}
        </ul>}
        <p className="small muted num" style={{ minHeight: "3.2em" }}>
          {punkt ? (
            <>
              <strong>{t.alter} {punkt.alter}:</strong> {t.gesamt} {e(punkt.wert)} · {t.vonDir} {e(punkt.eingezahlt)}
              {zeigeZulagen && <> · {t.vomStaat} {e(punkt.zulagen)}</>} · {t.wachstum} {e(punkt.wert - punkt.eingezahlt - punkt.zulagen)}
              {vergleich && aktiv !== null && <> · {vergleich.name} {e(vergleich.werte[aktiv] ?? 0)}</>}
            </>
          ) : (
            hilfe ? t.hilfe : null
          )}
        </p>
      </figcaption>
    </figure>
  );
}
