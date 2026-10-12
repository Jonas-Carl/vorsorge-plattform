import type { Lang } from "@/i18n";
import { texte } from "@/i18n/texte";
import { berechneZulage } from "@/lib/foerderung";
import { euro, prozent } from "@/lib/format";
import { berechne } from "@/lib/rechner";
import { EINFACHE_STARTWERTE } from "@/lib/startwerte";

const B = 520;
const H = 250;
const R = { o: 14, r: 6, u: 30, l: 6 };

/**
 * Grafik im Kopfbereich der Startseite: die Beispielrechnung des Rechners
 * mit seinen Startwerten – echte, berechnete Werte, keine Dekoration.
 */
export function HeroVisual({ lang }: { lang: Lang }) {
  const t = texte(lang).hero2;
  const r = texte(lang).rechner;
  const e = EINFACHE_STARTWERTE;
  const ergebnis = berechne(e);
  const v = ergebnis.verlauf;
  const n = v.length - 1;
  const eigen = ergebnis.einzahlungen + ergebnis.startkapital;
  const zulageJahr = berechneZulage({ eigenbeitragJahr: e.sparrate * 12, kinder: 0, berufseinsteigerbonus: false }).gesamt;
  const E = (x: number) => euro(x, lang);

  const oben = ergebnis.endkapital * 1.04;
  const x = (i: number) => R.l + (i / n) * (B - R.l - R.r);
  const y = (w: number) => R.o + (1 - Math.max(w, 0) / oben) * (H - R.o - R.u);
  const linie = (f: (i: number) => number) => v.map((_, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(f(i)).toFixed(1)}`).join("");
  const flaeche = (f: (i: number) => number) => `${linie(f)}L${x(n).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;
  const gesamt = (i: number) => v[i]!.wert;
  const mitStaat = (i: number) => Math.min(v[i]!.wert, v[i]!.eingezahlt + v[i]!.zulagen);
  const nurEigen = (i: number) => Math.min(v[i]!.wert, v[i]!.eingezahlt);

  return (
    <figure className="hv" aria-label={t.aria(E(e.sparrate), e.alter, E(ergebnis.endkapital), e.rentenalter)}>
      <div className="hv__karte">
        <div className="hv__kopf">
          <span className="hv__tag">{t.tag}</span>
          <span className="hv__annahme">{t.annahme(E(e.sparrate), e.alter)}</span>
        </div>
        <p className="hv__label">{r.ergebnis(e.rentenalter)}</p>
        <p className="hv__zahl">{E(ergebnis.endkapital)}</p>

        <svg className="hv__chart" viewBox={`0 0 ${B} ${H}`} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="hv-wachstum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#6fd3bd" stopOpacity="0.95" />
              <stop offset="1" stopColor="#6fd3bd" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((a) => (
            <line key={a} x1={R.l} x2={B - R.r} y1={y(oben * a * 0.96)} y2={y(oben * a * 0.96)} stroke="#e7e0d3" strokeWidth="1" strokeDasharray="3 6" />
          ))}
          <path d={flaeche(gesamt)} fill="url(#hv-wachstum)" />
          <path d={flaeche(mitStaat)} fill="#0f4c5c" opacity="0.55" />
          <path d={flaeche(nurEigen)} fill="#0b1f3a" />
          <path className="hv__linie" d={linie(gesamt)} fill="none" stroke="#17705f" strokeWidth="3" strokeLinecap="round" pathLength={1} />
          <circle className="hv__punkt" cx={x(n)} cy={y(gesamt(n))} r="7" fill="#fff" stroke="#17705f" strokeWidth="3" />
          <text x={R.l} y={H - 8} className="hv__achse">{t.alter(e.alter)}</text>
          <text x={B - R.r} y={H - 8} textAnchor="end" className="hv__achse">{t.alter(e.rentenalter)}</text>
        </svg>

        <ul className="hv__legende">
          <li><i style={{ background: "#0b1f3a" }} /><span>{r.vonDir}</span><b>{E(eigen)}</b></li>
          <li><i style={{ background: "#3f7480" }} /><span>{r.vomStaat}</span><b>{E(ergebnis.zulagen)}</b></li>
          <li><i style={{ background: "#6fd3bd" }} /><span>{r.wachstum}</span><b>{E(ergebnis.wertzuwachs)}</b></li>
        </ul>
        <p className="hv__hinweis">{t.hinweis(prozent(e.rendite, 2, lang), prozent(e.kosten, 2, lang))}</p>
      </div>

      <div className="hv__chip hv__chip--a" aria-hidden="true">
        <b>+ {E(zulageJahr)}</b>
        <span>{t.chipStaat}</span>
      </div>
    </figure>
  );
}
