import { reform2027, type ReformRegelwerk } from "@/config/foerderung";

export type ZulageEingabe = {
  /** Eigene Altersvorsorgebeiträge im Beitragsjahr in Euro. */
  eigenbeitragJahr: number;
  /** Kinder, für die dieser Person Kindergeld festgesetzt ist und die Kinderzulage zusteht. */
  kinder: number;
  /** true, wenn in diesem Beitragsjahr der einmalige Berufseinsteigerbonus anfällt. */
  berufseinsteigerbonus: boolean;
};

export type ZulageErgebnis = {
  mindesteigenbeitragErfuellt: boolean;
  grundzulage: number;
  kinderzulage: number;
  bonus: number;
  gesamt: number;
};

const runde = (x: number) => Math.round(x * 100) / 100;

/**
 * Zulagen nach der beitragsproportionalen Systematik (§§ 84–86 EStG n. F.).
 *
 * Modellannahme: Die Person ist unmittelbar zulageberechtigt. Mittelbar
 * berechtigte Ehegatten, der Sonderausgabenabzug und die Verteilung der
 * Kinderzulage zwischen Eltern werden NICHT abgebildet.
 */
export function berechneZulage(e: ZulageEingabe, r: ReformRegelwerk = reform2027): ZulageErgebnis {
  const beitrag = Math.max(0, e.eigenbeitragJahr);
  const kinder = Math.max(0, Math.floor(e.kinder));

  // § 86 EStG n. F.: ohne Mindesteigenbeitrag weder Grund- noch Kinderzulage.
  if (beitrag < r.mindesteigenbeitrag) {
    return { mindesteigenbeitragErfuellt: false, grundzulage: 0, kinderzulage: 0, bonus: 0, gesamt: 0 };
  }

  const { stufe1, stufe2 } = r.grundzulage;
  const inStufe1 = Math.min(beitrag, stufe1.bis);
  const inStufe2 = Math.min(Math.max(beitrag - stufe1.bis, 0), stufe2.bis - stufe1.bis);
  const grundzulage = runde(inStufe1 * stufe1.satz + inStufe2 * stufe2.satz);

  // § 85 EStG n. F.: je Kind 100 % der Beiträge, höchstens 300 Euro.
  const jeKind = Math.min(beitrag * r.kinderzulage.satz, r.kinderzulage.hoechstbetragJeKind);
  const kinderzulage = runde(jeKind * kinder);

  const bonus = e.berufseinsteigerbonus ? r.berufseinsteigerbonus.betrag : 0;

  return {
    mindesteigenbeitragErfuellt: true,
    grundzulage,
    kinderzulage,
    bonus,
    gesamt: runde(grundzulage + kinderzulage + bonus),
  };
}
