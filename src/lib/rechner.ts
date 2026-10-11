import { grenzen, szenarien, type Szenario } from "@/config/szenarien";
import { reform2027, type ReformRegelwerk } from "@/config/foerderung";
import { berechneZulage } from "@/lib/foerderung";

/**
 * Berechnungslogik des Altersvorsorgerechners.
 *
 * ANNAHMEN (auch auf /quellen-methodik dokumentiert):
 *  1. Monatliche Fortschreibung. Einzahlungen erfolgen zu MONATSBEGINN (vorschüssig).
 *  2. Die Rendite ist eine effektive Jahresrendite VOR Kosten. Monatsfaktor:
 *     (1 + Jahresrendite)^(1/12).
 *  3. Laufende Kosten sind ein jährlicher Prozentsatz des Anlagevermögens und
 *     werden monatlich anteilig am Monatsende entnommen: Faktor (1 − Kosten)^(1/12).
 *     Kosten werden NUR an dieser Stelle berücksichtigt (keine Doppelzählung).
 *     Abschluss- oder Wechselkosten werden nicht modelliert.
 *  4. Die optionale Dynamik erhöht den Sparbeitrag jeweils nach 12 Monaten.
 *  5. Zulagen (falls aktiviert) werden vereinfachend am ENDE des jeweiligen
 *     Beitragsjahres gutgeschrieben; die Regeln gelten als über die Laufzeit konstant.
 *  6. Kaufkraft: nominales Endkapital / (1 + Inflation)^Jahre.
 *  7. Steuern und die Auszahlungsphase werden nicht modelliert.
 *
 * Ergebnisse sind Modellrechnungen – keine Prognosen und keine Zusagen.
 */

export type RechnerEingabe = {
  alter: number;
  rentenalter: number;
  /** Monatlicher Sparbeitrag in Euro (im ersten Jahr). */
  sparrate: number;
  startkapital: number;
  /** Effektive Jahresrendite vor Kosten, z. B. 0.05. */
  rendite: number;
  /** Laufende Kosten pro Jahr als Anteil des Vermögens, z. B. 0.01. */
  kosten: number;
  /** Jährliche Erhöhung des Sparbeitrags, z. B. 0.02. */
  dynamik: number;
  inflation: number;
  foerderung: FoerderEingabe;
};

export type FoerderEingabe = {
  /** Zulagen in die Modellrechnung einbeziehen. */
  aktiv: boolean;
  kinder: number;
  /** Für wie viele Jahre noch Kindergeld erwartet wird (vereinfachend für alle Kinder). */
  kindergeldJahre: number;
};

export type Jahreswert = {
  /** 0 = heute, n = Ende des n-ten Jahres. */
  jahr: number;
  alter: number;
  /** Kumulierte eigene Einzahlungen inkl. Startkapital. */
  eingezahlt: number;
  /** Kumulierte Zulagen. */
  zulagen: number;
  /** Modellierter Depotwert nach Kosten (nominal). */
  wert: number;
  /** Depotwert in heutiger Kaufkraft. */
  wertReal: number;
};

export type RechnerErgebnis = {
  jahre: number;
  /** Summe der laufenden Sparbeiträge (ohne Startkapital). */
  einzahlungen: number;
  startkapital: number;
  zulagen: number;
  endkapital: number;
  /** Endkapital − Startkapital − Einzahlungen − Zulagen. */
  wertzuwachs: number;
  /** Differenz zum Endkapital derselben Rechnung ohne laufende Kosten. */
  kostenwirkung: number;
  endkapitalOhneKosten: number;
  endkapitalReal: number;
  /** Zulagen im ersten Beitragsjahr (Orientierungswert). */
  zulageErstesJahr: number;
  verlauf: Jahreswert[];
};

export const standardEingabe: RechnerEingabe = {
  alter: grenzen.alter.start,
  rentenalter: grenzen.rentenalter.start,
  sparrate: grenzen.sparrate.start,
  startkapital: grenzen.startkapital.start,
  rendite: grenzen.rendite.start,
  kosten: grenzen.kosten.start,
  dynamik: grenzen.dynamik.start,
  inflation: grenzen.inflation.start,
  foerderung: { aktiv: false, kinder: grenzen.kinder.start, kindergeldJahre: grenzen.kindergeldJahre.start },
};

const klemme = (x: number, min: number, max: number) =>
  Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : min;

/** Begrenzt alle Eingaben auf die zulässigen Bereiche und stellt Laufzeit ≥ 1 Jahr sicher. */
export function bereinigeEingabe(e: RechnerEingabe): RechnerEingabe {
  const alter = Math.round(klemme(e.alter, grenzen.alter.min, grenzen.alter.max));
  const rentenalter = Math.round(
    klemme(e.rentenalter, Math.max(grenzen.rentenalter.min, alter + 1), grenzen.rentenalter.max),
  );
  return {
    alter,
    rentenalter,
    sparrate: klemme(e.sparrate, 0, grenzen.sparrate.max),
    startkapital: klemme(e.startkapital, grenzen.startkapital.min, grenzen.startkapital.max),
    rendite: klemme(e.rendite, grenzen.rendite.min, grenzen.rendite.max),
    kosten: klemme(e.kosten, grenzen.kosten.min, grenzen.kosten.max),
    dynamik: klemme(e.dynamik, grenzen.dynamik.min, grenzen.dynamik.max),
    inflation: klemme(e.inflation, grenzen.inflation.min, grenzen.inflation.max),
    foerderung: {
      aktiv: Boolean(e.foerderung.aktiv),
      kinder: Math.round(klemme(e.foerderung.kinder, grenzen.kinder.min, grenzen.kinder.max)),
      kindergeldJahre: Math.round(
        klemme(e.foerderung.kindergeldJahre, grenzen.kindergeldJahre.min, grenzen.kindergeldJahre.max),
      ),
    },
  };
}

export function berechne(roh: RechnerEingabe, regelwerk: ReformRegelwerk = reform2027): RechnerErgebnis {
  const e = bereinigeEingabe(roh);
  const jahre = e.rentenalter - e.alter;

  const renditeMonat = Math.pow(1 + e.rendite, 1 / 12);
  const kostenMonat = Math.pow(1 - e.kosten, 1 / 12);

  let wert = e.startkapital;
  let wertOhneKosten = e.startkapital;
  let einzahlungen = 0;
  let zulagen = 0;
  let zulageErstesJahr = 0;

  const verlauf: Jahreswert[] = [
    { jahr: 0, alter: e.alter, eingezahlt: e.startkapital, zulagen: 0, wert, wertReal: wert },
  ];

  for (let j = 0; j < jahre; j++) {
    const rate = e.sparrate * Math.pow(1 + e.dynamik, j);
    let beitragImJahr = 0;

    for (let m = 0; m < 12; m++) {
      // 1. Einzahlung zu Monatsbeginn
      wert += rate;
      wertOhneKosten += rate;
      beitragImJahr += rate;
      // 2. Wertentwicklung über den Monat (vor Kosten)
      wert *= renditeMonat;
      wertOhneKosten *= renditeMonat;
      // 3. Laufende Kosten anteilig am Monatsende
      wert *= kostenMonat;
    }
    einzahlungen += beitragImJahr;

    if (e.foerderung.aktiv) {
      const z = berechneZulage(
        {
          eigenbeitragJahr: beitragImJahr,
          kinder: j < e.foerderung.kindergeldJahre ? e.foerderung.kinder : 0,
          // Einmalig im ersten Beitragsjahr, wenn zu dessen Beginn das 25. Lebensjahr
          // noch nicht vollendet ist.
          berufseinsteigerbonus: j === 0 && e.alter < regelwerk.berufseinsteigerbonus.vorVollendungLebensjahr,
        },
        regelwerk,
      ).gesamt;
      wert += z;
      wertOhneKosten += z;
      zulagen += z;
      if (j === 0) zulageErstesJahr = z;
    }

    verlauf.push({
      jahr: j + 1,
      alter: e.alter + j + 1,
      eingezahlt: e.startkapital + einzahlungen,
      zulagen,
      wert,
      wertReal: wert / Math.pow(1 + e.inflation, j + 1),
    });
  }

  return {
    jahre,
    einzahlungen,
    startkapital: e.startkapital,
    zulagen,
    endkapital: wert,
    wertzuwachs: wert - e.startkapital - einzahlungen - zulagen,
    kostenwirkung: wertOhneKosten - wert,
    endkapitalOhneKosten: wertOhneKosten,
    endkapitalReal: wert / Math.pow(1 + e.inflation, jahre),
    zulageErstesJahr,
    verlauf,
  };
}

export type SzenarioErgebnis = { szenario: Szenario; ergebnis: RechnerErgebnis };

/** Rechnet dieselben Eingaben mit den drei konfigurierten Renditeannahmen. */
export function berechneSzenarien(e: RechnerEingabe, liste: Szenario[] = szenarien): SzenarioErgebnis[] {
  return liste.map((szenario) => ({
    szenario,
    ergebnis: berechne({ ...e, rendite: szenario.renditePa }),
  }));
}
