const pfade = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  chart: "M4 19V5M4 19h16M8 15l3.5-4 3 2.5L19 8",
  book: "M5 4.5h9a3 3 0 013 3V20H8a3 3 0 01-3-3V4.5zM17 20h2V8",
  shield: "M12 3l7 3v5.5c0 4.4-2.9 7.9-7 9.5-4.1-1.6-7-5.1-7-9.5V6l7-3zM9 12l2.2 2.2L15.2 10",
  coins: "M12 9c3.9 0 7-1.1 7-2.5S15.900 4 12 4 5 5.100 5 6.500 8.100 9 12 9zM5 6.500V12c0 1.400 3.100 2.500 7 2.500s7-1.100 7-2.500V6.500M5 12v5.500C5 18.900 8.100 20 12 20s7-1.100 7-2.500V12",
  family: "M8 8.500a2.500 2.500 0 100-5 2.500 2.500 0 000 5zM16.500 9.500a2 2 0 100-4 2 2 0 000 4zM3.500 20v-4a4.500 4.500 0 019 0v4M13.500 20v-3.500a3 3 0 016 0V20",
  scale: "M12 4v16M7 20h10M5 8h14M5 8l-2.500 6a3 3 0 005 0L5 8zM19 8l-2.500 6a3 3 0 005 0L19 8z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7.500V12l3 2",
  doc: "M7 3.500h7l4 4V20.500H7V3.500zM14 3.500v4h4M10 12.500h5M10 16h5",
  users: "M9 10a3 3 0 100-6 3 3 0 000 6zM3.500 19.500v-1a5.500 5.500 0 0111 0v1M16 10.500a2.500 2.500 0 100-5M17.500 14.200a4.500 4.500 0 013 4.300v1",
  lock: "M7 10.500V8a5 5 0 0110 0v2.500M5.500 10.500h13V20h-13v-9.500zM12 14v2.500",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  info: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5.500M12 7.600v.100",
  trend: "M4 17l5.500-6 4 3.500L20 7M20 7h-4.500M20 7v4.500",
  sprout: "M12 20v-8M12 12c0-3 2-5 6-5 0 3-2 5-6 5zM12 14c0-2.500-1.700-4-5-4 0 2.500 1.700 4 5 4z",
  gift: "M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-1.500-3-5-3-5-1s3 1 5 1zM12 7c1.500-3 5-3 5-1s-3 1-5 1z",
  sun: "M12 16a4 4 0 100-8 4 4 0 000 8zM12 3v2M12 19v2M3 12h2M19 12h2M5.600 5.600l1.400 1.400M17 17l1.400 1.400M5.600 18.400L7 17M17 7l1.400-1.400",
} as const;

export type IconName = keyof typeof pfade;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={pfade[name]} />
    </svg>
  );
}

export function LogoMark() {
  return (
    <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="#0f4c5c" />
      <path d="M7 22.500c4.500 0 6-3 9-8.500s4.500-6 9-6" fill="none" stroke="#6fd3bd" strokeWidth="2.400" strokeLinecap="round" />
      <circle cx="25" cy="8" r="2.300" fill="#d9bd83" />
    </svg>
  );
}

/** Hero-Bild: ein Euro von dir, 50 Cent vom Staat. */
export function Muenzen({ links, rechts }: { links: string; rechts: string }) {
  return (
    <svg className="muenzen" viewBox="0 0 420 300" role="img" aria-label={`1 € ${links} + 50 Cent ${rechts}`}>
      <ellipse cx="150" cy="262" rx="110" ry="14" fill="#000" opacity="0.18" />
      <g className="muenzen__a">
        <circle cx="150" cy="140" r="108" fill="#e0b04a" />
        <circle cx="150" cy="140" r="108" fill="none" stroke="#b8862c" strokeWidth="6" />
        <circle cx="150" cy="140" r="84" fill="#f1cd78" />
        <text x="150" y="168" textAnchor="middle" fontSize="84" fontWeight="700" fill="#5d4210">1 €</text>
        <text x="150" y="212" textAnchor="middle" fontSize="19" fontWeight="650" fill="#5d4210" letterSpacing="1.500">{links.toUpperCase()}</text>
      </g>
      <text x="262" y="118" textAnchor="middle" fontSize="54" fontWeight="700" fill="#ffffff">+</text>
      <g className="muenzen__b">
        <circle cx="322" cy="176" r="66" fill="#6fd3bd" />
        <circle cx="322" cy="176" r="66" fill="none" stroke="#2f9f88" strokeWidth="5" />
        <circle cx="322" cy="176" r="50" fill="#a9e6d8" />
        <text x="322" y="184" textAnchor="middle" fontSize="42" fontWeight="700" fill="#0c4a3e">50</text>
        <text x="322" y="205" textAnchor="middle" fontSize="15" fontWeight="650" fill="#0c4a3e">CENT</text>
      </g>
      <text x="322" y="272" textAnchor="middle" fontSize="16" fontWeight="650" fill="#6fd3bd" letterSpacing="1.200">{rechts.toUpperCase()}</text>
    </svg>
  );
}
