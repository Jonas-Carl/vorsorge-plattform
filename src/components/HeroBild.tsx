/**
 * Illustration im Kopfbereich der Startseite: Münzstapel werden höher, darauf
 * wächst aus einem Keim eine kräftige Pflanze. Bewusst ohne Zahlen – das Bild
 * soll nur die Idee zeigen: regelmäßig sparen, mit der Zeit wächst etwas.
 */

const BODEN = 372;
const MUENZE = 13;
const STAPEL = [
  { x: 92, muenzen: 1, hoehe: 22, blaetter: 1 },
  { x: 204, muenzen: 2, hoehe: 46, blaetter: 2 },
  { x: 316, muenzen: 4, hoehe: 78, blaetter: 3 },
  { x: 428, muenzen: 6, hoehe: 118, blaetter: 4 },
];

function Muenzstapel({ x, muenzen }: { x: number; muenzen: number }) {
  return (
    <g>
      {Array.from({ length: muenzen }, (_, k) => {
        const y = BODEN - k * MUENZE;
        return (
          <g key={k}>
            <ellipse cx={x} cy={y} rx="40" ry="11" fill="#4dbfa6" />
            <rect x={x - 40} y={y - MUENZE} width="80" height={MUENZE} fill="#4dbfa6" />
            <ellipse cx={x} cy={y - MUENZE} rx="40" ry="11" fill="#9be7d4" stroke="#4dbfa6" strokeWidth="2" />
          </g>
        );
      })}
      <text x={x} y={BODEN - muenzen * MUENZE + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#17705f">€</text>
    </g>
  );
}

function Pflanze({ x, y, hoehe, blaetter, nr }: { x: number; y: number; hoehe: number; blaetter: number; nr: number }) {
  const groesse = 9 + hoehe * 0.085;
  return (
    <g className="hb__pflanze" style={{ animationDelay: `${0.25 + nr * 0.18}s` }}>
      <path d={`M${x},${y} C${x - 4},${y - hoehe * 0.4} ${x + 5},${y - hoehe * 0.7} ${x},${y - hoehe}`} fill="none" stroke="#17705f" strokeWidth="4" strokeLinecap="round" />
      {Array.from({ length: blaetter }, (_, k) => {
        const yy = y - (hoehe * (k + 1)) / (blaetter + 0.6);
        const s = groesse * (1 - k * 0.1);
        return (
          <g key={k}>
            <ellipse cx={x - s} cy={yy - s * 0.3} rx={s} ry={s * 0.48} fill="#2fa58c" transform={`rotate(28 ${x - s} ${yy - s * 0.3})`} />
            <ellipse cx={x + s} cy={yy - s * 0.55} rx={s} ry={s * 0.48} fill="#5fcfb3" transform={`rotate(-28 ${x + s} ${yy - s * 0.55})`} />
          </g>
        );
      })}
      <ellipse cx={x} cy={y - hoehe - groesse * 0.5} rx={groesse * 0.5} ry={groesse * 0.85} fill="#2fa58c" />
    </g>
  );
}

export function HeroBild({ alt, heute, morgen }: { alt: string; heute: string; morgen: string }) {
  const erster = STAPEL[0]!;
  const letzter = STAPEL[STAPEL.length - 1]!;
  return (
    <svg className="hb" viewBox="0 0 520 440" role="img" aria-label={alt}>
      {/* weiche Farbflächen */}
      <circle cx="392" cy="150" r="138" fill="#ece6ff" />
      <ellipse cx="170" cy="286" rx="168" ry="118" fill="#e0efff" />
      <circle cx="96" cy="120" r="44" fill="#dff6ee" />

      {/* Sonne und kleine Funken */}
      <g className="hb__sonne">
        <circle cx="96" cy="120" r="22" fill="#ffe9a8" />
      </g>
      <path className="hb__funke" d="M468 62l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#a996f0" />
      <path className="hb__funke hb__funke--b" d="M250 70l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#6fb1f0" />

      {/* Weg von heute nach morgen */}
      <path
        className="hb__weg"
        d={`M${erster.x},${BODEN - erster.muenzen * MUENZE - erster.hoehe - 34} C${erster.x + 110},${BODEN - 150} ${letzter.x - 150},${BODEN - 250} ${letzter.x - 26},${BODEN - letzter.muenzen * MUENZE - letzter.hoehe - 58}`}
        fill="none" stroke="#6fb1f0" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 11" pathLength={1}
      />

      {/* Boden */}
      <ellipse cx="260" cy={BODEN + 6} rx="238" ry="18" fill="#cfeee3" />

      {STAPEL.map((s, i) => (
        <g key={s.x}>
          <Muenzstapel x={s.x} muenzen={s.muenzen} />
          <Pflanze x={s.x} y={BODEN - s.muenzen * MUENZE - 9} hoehe={s.hoehe} blaetter={s.blaetter} nr={i} />
        </g>
      ))}

      {/* schwebende Münze */}
      <g className="hb__muenze">
        <circle cx="352" cy="96" r="20" fill="#9be7d4" stroke="#4dbfa6" strokeWidth="3" />
        <text x="352" y="103" textAnchor="middle" fontSize="20" fontWeight="700" fill="#17705f">€</text>
      </g>

      <text x={erster.x} y="418" textAnchor="middle" className="hb__text">{heute}</text>
      <text x={letzter.x} y="418" textAnchor="middle" className="hb__text hb__text--stark">{morgen}</text>
    </svg>
  );
}
