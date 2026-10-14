import type { Lang } from "@/i18n";
import { texte } from "@/i18n/texte";
import { euro, prozent } from "@/lib/format";
import { berechne } from "@/lib/rechner";
import { EINFACHE_STARTWERTE } from "@/lib/startwerte";
import { Icon, type IconName } from "./Icon";

/**
 * Beispiel für die Karte: 47 Jahre sparen (ab 20 bis 67), 150 € im Monat, 7 % Wachstum pro Jahr
 * vor Kosten. Kosten und Zuschuss wie im Rechner (1 % Kosten, Zulagen eingerechnet). Die
 * Annahmen stehen als Hinweis unter dem Diagramm.
 */
const BEISPIEL = { ...EINFACHE_STARTWERTE, alter: 20, sparrate: 150, rendite: 0.07 };

/** Zahl der Balken im kleinen Diagramm. */
const BALKEN = 7;
const B = { breite: 400, hoehe: 146, boden: 138, balken: 32 };

type Punkt = [number, number];

/**
 * Der „Fluss“ unter den Förderkarten (viewBox 640 × 300): Er kommt von links unten und mündet
 * oben rechts in die Linie neben den Karten. Mittellinie als vier kubische Bézier-Abschnitte.
 */
const FLUSS_ABSCHNITTE: [Punkt, Punkt, Punkt, Punkt][] = [
  [[0, 292], [170, 284], [420, 282], [470, 252]],
  [[470, 252], [510, 228], [330, 214], [318, 186]],
  [[318, 186], [306, 156], [520, 150], [580, 120]],
  [[580, 120], [612, 104], [620, 60], [620, 8]],
];
const FLUSS_MITTE = FLUSS_ABSCHNITTE.map(([a, b, c, d], i) => `${i === 0 ? `M${a.join(" ")}` : ""}C${b.join(" ")} ${c.join(" ")} ${d.join(" ")}`).join("");
const FLUSS_SCHICHTEN = 16;

/**
 * Der Fluss ist an der Quelle breit und wird zum Ziel hin schmal. Dafür liegen mehrere Linien
 * übereinander: die dünnste über die ganze Länge, jede breitere nur über ein kürzeres Anfangsstück.
 *
 * Jede Schicht bekommt `pathLength` = ihr Anteil an der Gesamtlänge. Dadurch gilt für alle dieselbe
 * Skala (1 = ganzer Fluss) und eine einzige `stroke-dashoffset`-Animation deckt alle Schichten
 * gleichzeitig auf. Bewusst ohne Maske und ohne animierte Deckkraft – das zeichnet Safari fehlerhaft.
 */
function flussSchichten(): { d: string; anteil: number; breite: number }[] {
  const punkte: Punkt[] = [];
  const TEILE = 18;
  FLUSS_ABSCHNITTE.forEach(([a, b, c, d], nr) => {
    for (let i = nr === 0 ? 0 : 1; i <= TEILE; i++) {
      const t = i / TEILE;
      const u = 1 - t;
      punkte.push([
        u ** 3 * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t ** 3 * d[0],
        u ** 3 * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t ** 3 * d[1],
      ]);
    }
  });
  const weg = [0];
  for (let i = 1; i < punkte.length; i++) {
    weg.push(weg[i - 1]! + Math.hypot(punkte[i]![0] - punkte[i - 1]![0], punkte[i]![1] - punkte[i - 1]![1]));
  }
  const gesamt = weg[weg.length - 1]!;
  return Array.from({ length: FLUSS_SCHICHTEN }, (_, k) => {
    const anteil = 1 - k / FLUSS_SCHICHTEN;
    const ende = weg.findIndex((w) => w / gesamt >= anteil - 1e-9);
    const d = punkte.slice(0, ende + 1).map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
    return { d, anteil, breite: 2 * (11 * (1 - anteil) ** 1.1 + 1.3) };
  });
}

/**
 * Rechte Seite des Kopfbereichs der Startseite: die Karte „Deine Möglichkeiten“
 * und daneben drei allgemeine Förderhinweise.
 *
 * Zahl und Balken sind nicht ausgedacht: Sie kommen aus derselben Rechenlogik
 * wie der Rechner darunter, mit den Annahmen aus `BEISPIEL`. Die Annahmen
 * stehen als Hinweis in der Karte. Die Beträge der Förderhinweise kommen aus
 * `config/foerderung.ts` (über `F` in den Texten), wie überall auf der Seite.
 */
export function HeroKarte({ lang }: { lang: Lang }) {
  const h = texte(lang).hero2;
  const e = BEISPIEL;
  const { verlauf, endkapital } = berechne(e);

  const letzter = verlauf.length - 1;
  const werte = Array.from({ length: BALKEN }, (_, i) => verlauf[Math.round((i * letzter) / (BALKEN - 1))]?.wert ?? 0);
  const max = Math.max(...werte, 1);
  const schritt = (B.breite - B.balken - 16) / (BALKEN - 1);
  const saeulen = werte.map((w, i) => {
    const hoehe = Math.max(10, (w / max) * (B.boden - 34));
    const x = 16 + i * schritt;
    return { x, y: B.boden - hoehe, hoehe, mitte: x + B.balken / 2 };
  });
  const linie = saeulen.map((s) => `${s.mitte},${s.y - 14}`).join(" ");
  const E = (x: number) => euro(x, lang);

  return (
    <div className="hk">
      <figure className="hk__karte">
        <figcaption>
          <p className="hk__titel">{h.karteTitel}</p>
          <p className="hk__label">{h.karteLabel}</p>
          <p className="hk__zahl">{E(endkapital)}</p>
        </figcaption>
        <svg className="hk__chart" viewBox={`0 0 ${B.breite} ${B.hoehe}`} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="hk-balken" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#45e2c4" stopOpacity="0.95" />
              <stop offset="1" stopColor="#45e2c4" stopOpacity="0.22" />
            </linearGradient>
          </defs>
          {saeulen.map((s) => (
            <rect key={s.x} x={s.x} y={s.y} width={B.balken} height={s.hoehe} rx="3" fill="url(#hk-balken)" />
          ))}
          <polyline points={linie} fill="none" stroke="#45e2c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {saeulen.map((s) => (
            <circle key={s.x} cx={s.mitte} cy={s.y - 14} r="5" fill="#d6fff5" stroke="#45e2c4" strokeWidth="2" />
          ))}
        </svg>
        <div className="hk__achse">
          <span>{h.heute}</span>
          <span>{h.karteAlter(e.rentenalter)}</span>
        </div>
        <p className="hk__hinweis">{h.karteHinweis(E(e.sparrate), e.alter, prozent(e.rendite, 2, lang))}</p>
      </figure>

      <div className="hk__seite">
        {/* Der Fluss – rein dekorativ, nur im Desktop-Layout sichtbar. Animation in start.css. */}
        <svg className="hk__fluss" viewBox="0 0 640 300" aria-hidden="true" focusable="false">
          <defs>
            {/* Deckende Farben (links in die Hintergrundfarbe auslaufend), damit sich die Schichten nicht aufaddieren. */}
            <linearGradient id="hk-fluss-farbe" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="640" y2="0">
              <stop offset="0.14" stopColor="#05121a" />
              <stop offset="0.42" stopColor="#1c7069" />
              <stop offset="1" stopColor="#45e2c4" />
            </linearGradient>
            <linearGradient id="hk-fluss-glanzfarbe" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="640" y2="0">
              <stop offset="0.2" stopColor="#d6fff5" stopOpacity="0" />
              <stop offset="0.5" stopColor="#d6fff5" stopOpacity="0.45" />
              <stop offset="0.9" stopColor="#d6fff5" stopOpacity="0.4" />
              <stop offset="1" stopColor="#d6fff5" stopOpacity="0" />
            </linearGradient>
          </defs>
          {flussSchichten().map((f) => (
            <path key={f.anteil} className="hk__fluss-zug" d={f.d} pathLength={f.anteil} fill="none" stroke="url(#hk-fluss-farbe)" strokeWidth={f.breite.toFixed(2)} strokeLinejoin="round" strokeDasharray="2 2" strokeDashoffset="1" />
          ))}
          <path className="hk__fluss-glanz" d={FLUSS_MITTE} pathLength={1} fill="none" stroke="url(#hk-fluss-glanzfarbe)" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.08 0.12" />
        </svg>
        <div className="hk__leiste">
        <p className="hk__kopf" id="hk-foerderungen">{h.punkteTitel}</p>
        <ul className="hk__punkte" aria-labelledby="hk-foerderungen">
          {h.punkte.map((p) => (
            <li key={p.titel}>
              <span className="hk__bild"><Icon name={p.bild as IconName} size={24} /></span>
              <span className="hk__text">
                <b>{p.titel}</b>
                <span>{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </div>
  );
}
