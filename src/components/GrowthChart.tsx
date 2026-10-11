"use client";

import { useEffect, useRef, useState } from "react";
import { euro, euroKompakt, type Lang } from "@/lib/format";
import type { Jahreswert } from "@/lib/rechner";

const R = { o: 16, r: 12, u: 34, l: 74 };

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
  const schritt = [1, 2, 2.5, 5, 10].map((f) => f * potenz).find((s) => s >= roh) ?? roh;
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

type Props = { verlauf: Jahreswert[]; zeigeReal: boolean; zeigeZulagen: boolean; lang: Lang; t: ChartTexte };

export function GrowthChart({ verlauf, zeigeReal, zeigeZulagen, lang, t }: Props) {
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
  const H = Math.round(Math.min(340, Math.max(230, B * 0.5)));

  const n = verlauf.length - 1;
  const maxWert = Math.max(...verlauf.map((p) => Math.max(p.wert, p.eingezahlt + p.zulagen)));
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

          <path d={flaeche((p) => p.wert)} fill={FARBEN.zuwachs} opacity={0.9} />
          {zeigeZulagen && <path d={flaeche((p) => Math.min(p.wert, p.eingezahlt + p.zulagen))} fill={FARBEN.zulage} />}
          <path d={flaeche((p) => Math.min(p.wert, p.eingezahlt))} fill={FARBEN.einzahlung} />
          <path d={linie((p) => p.wert)} fill="none" stroke="#17705f" strokeWidth={2} />
          {zeigeReal && <path d={linie((p) => p.wertReal)} fill="none" stroke={FARBEN.real} strokeWidth={2} strokeDasharray="6 5" />}

          {punkt && aktiv !== null && (
            <g pointerEvents="none">
              <line x1={x(aktiv)} x2={x(aktiv)} y1={R.o} y2={y(0)} stroke="#12202e" strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={x(aktiv)} cy={y(punkt.wert)} r={5} fill="#fff" stroke="#17705f" strokeWidth={2} />
            </g>
          )}
        </svg>
      </div>

      <figcaption className="stack" style={{ marginTop: "0.75rem" }}>
        <ul className="legend">
          <li><i style={{ background: FARBEN.einzahlung }} /> {t.vonDir}</li>
          {zeigeZulagen && <li><i style={{ background: FARBEN.zulage }} /> {t.vomStaat}</li>}
          <li><i style={{ background: FARBEN.zuwachs }} /> {t.wachstum}</li>
          {zeigeReal && <li><i className="line" /> {t.kaufkraft}</li>}
        </ul>
        <p className="small muted num" style={{ minHeight: "3.2em" }}>
          {punkt ? (
            <>
              <strong>{t.alter} {punkt.alter}:</strong> {t.gesamt} {e(punkt.wert)} · {t.vonDir} {e(punkt.eingezahlt)}
              {zeigeZulagen && <> · {t.vomStaat} {e(punkt.zulagen)}</>} · {t.wachstum} {e(punkt.wert - punkt.eingezahlt - punkt.zulagen)}
            </>
          ) : (
            t.hilfe
          )}
        </p>
      </figcaption>
    </figure>
  );
}
