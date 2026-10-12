import { describe, expect, it } from "vitest";
import { berechne, berechneSzenarien, bereinigeEingabe, monatlicheAuszahlung, standardEingabe, type RechnerEingabe } from "./rechner";
import { berechneZulage } from "./foerderung";
import { euro, prozent } from "./format";
import { maxGrundzulage, reform2027, regelwerkFuerBeitragsjahr } from "@/config/foerderung";
import { grenzen } from "@/config/szenarien";

const basis: RechnerEingabe = {
  ...standardEingabe,
  alter: 30,
  rentenalter: 67,
  sparrate: 100,
  startkapital: 0,
  rendite: 0,
  kosten: 0,
  dynamik: 0,
  inflation: 0,
  foerderung: { aktiv: false, kinder: 0, kindergeldJahre: 0 },
};

/** Unabhängige Kontrollrechnung: Endwert einer vorschüssigen Monatsrente (geschlossene Formel). */
function rentenendwertVorschuessig(rate: number, jahresrendite: number, jahre: number): number {
  const q = Math.pow(1 + jahresrendite, 1 / 12);
  const n = jahre * 12;
  return rate * q * ((Math.pow(q, n) - 1) / (q - 1));
}

describe("Rechner – Grundfälle", () => {
  it("ohne Verzinsung entspricht das Endkapital exakt den Einzahlungen", () => {
    const r = berechne(basis);
    expect(r.jahre).toBe(37);
    expect(r.einzahlungen).toBeCloseTo(100 * 12 * 37, 6);
    expect(r.endkapital).toBeCloseTo(44_400, 6);
    expect(r.wertzuwachs).toBeCloseTo(0, 6);
    expect(r.kostenwirkung).toBeCloseTo(0, 6);
  });

  it("stimmt mit der geschlossenen Rentenendwertformel überein (5 % p. a., 37 Jahre)", () => {
    const r = berechne({ ...basis, rendite: 0.05 });
    expect(r.endkapital).toBeCloseTo(rentenendwertVorschuessig(100, 0.05, 37), 4);
  });

  it("sehr kurze Laufzeit: 1 Jahr", () => {
    const r = berechne({ ...basis, alter: 66, rentenalter: 67, rendite: 0.05 });
    expect(r.jahre).toBe(1);
    expect(r.verlauf).toHaveLength(2);
    expect(r.endkapital).toBeCloseTo(rentenendwertVorschuessig(100, 0.05, 1), 6);
  });

  it("lange Laufzeit: 52 Jahre bleibt konsistent zur Formel", () => {
    const r = berechne({ ...basis, alter: 18, rentenalter: 70, rendite: 0.07 });
    expect(r.jahre).toBe(52);
    expect(r.endkapital / rentenendwertVorschuessig(100, 0.07, 52)).toBeCloseTo(1, 9);
  });

  it("kleine und große Sparbeiträge skalieren linear", () => {
    const klein = berechne({ ...basis, sparrate: 10, rendite: 0.05 });
    const gross = berechne({ ...basis, sparrate: 1000, rendite: 0.05 });
    expect(gross.endkapital / klein.endkapital).toBeCloseTo(100, 9);
  });

  it("Startkapital wächst mit der Jahresrendite: K · (1 + r)^n", () => {
    const r = berechne({ ...basis, sparrate: 0, startkapital: 10_000, rendite: 0.05, alter: 57, rentenalter: 67 });
    expect(r.endkapital).toBeCloseTo(10_000 * Math.pow(1.05, 10), 6);
    expect(r.einzahlungen).toBe(0);
    expect(r.wertzuwachs).toBeCloseTo(10_000 * Math.pow(1.05, 10) - 10_000, 6);
  });
});

describe("Rechner – Kosten, Dynamik, Inflation", () => {
  it("laufende Kosten wirken wie ein Nettofaktor (1 + r)(1 − k) pro Jahr", () => {
    const r = berechne({ ...basis, sparrate: 0, startkapital: 10_000, rendite: 0.05, kosten: 0.01, alter: 47, rentenalter: 67 });
    expect(r.endkapital).toBeCloseTo(10_000 * Math.pow(1.05 * 0.99, 20), 6);
    expect(r.endkapitalOhneKosten).toBeCloseTo(10_000 * Math.pow(1.05, 20), 6);
    expect(r.kostenwirkung).toBeCloseTo(r.endkapitalOhneKosten - r.endkapital, 9);
  });

  it("Kosten mindern das Ergebnis und werden nicht doppelt gezählt", () => {
    const ohne = berechne({ ...basis, rendite: 0.05 });
    const mit = berechne({ ...basis, rendite: 0.05, kosten: 0.01 });
    expect(mit.endkapital).toBeLessThan(ohne.endkapital);
    expect(mit.endkapitalOhneKosten).toBeCloseTo(ohne.endkapital, 6);
    // Identität: Einzahlungen + Wertzuwachs (nach Kosten) = Endkapital
    expect(mit.einzahlungen + mit.startkapital + mit.zulagen + mit.wertzuwachs).toBeCloseTo(mit.endkapital, 6);
  });

  it("Dynamik erhöht den Sparbeitrag jährlich", () => {
    const r = berechne({ ...basis, alter: 64, rentenalter: 67, dynamik: 0.02 });
    expect(r.einzahlungen).toBeCloseTo(1200 * (1 + 1.02 + 1.02 ** 2), 6);
  });

  it("Kaufkraft: nominal / (1 + Inflation)^Jahre", () => {
    const r = berechne({ ...basis, rendite: 0.05, inflation: 0.02 });
    expect(r.endkapitalReal).toBeCloseTo(r.endkapital / Math.pow(1.02, 37), 6);
    expect(berechne({ ...basis, rendite: 0.05, inflation: 0 }).endkapitalReal).toBeCloseTo(r.endkapital, 6);
  });

  it("Verlauf ist konsistent zu den Kennzahlen", () => {
    const r = berechne({ ...basis, rendite: 0.05, kosten: 0.01, startkapital: 5000, inflation: 0.02 });
    const letzter = r.verlauf.at(-1)!;
    expect(r.verlauf).toHaveLength(r.jahre + 1);
    expect(letzter.wert).toBeCloseTo(r.endkapital, 9);
    expect(letzter.wertReal).toBeCloseTo(r.endkapitalReal, 9);
    expect(letzter.eingezahlt).toBeCloseTo(r.einzahlungen + r.startkapital, 9);
    expect(r.verlauf[0]!.wert).toBe(5000);
  });
});

describe("Rechner – Eingabegrenzen und ungültige Werte", () => {
  it("NaN und Werte außerhalb der Grenzen werden bereinigt", () => {
    const e = bereinigeEingabe({
      ...basis,
      alter: Number.NaN,
      rentenalter: 200,
      sparrate: -50,
      rendite: 5,
      kosten: -1,
      inflation: Number.POSITIVE_INFINITY,
    });
    expect(e.alter).toBe(grenzen.alter.min);
    expect(e.rentenalter).toBe(grenzen.rentenalter.max);
    expect(e.sparrate).toBe(0);
    expect(e.rendite).toBe(grenzen.rendite.max);
    expect(e.kosten).toBe(0);
    expect(e.inflation).toBe(grenzen.inflation.min);
  });

  it("Rentenalter liegt immer mindestens ein Jahr nach dem aktuellen Alter", () => {
    const e = bereinigeEingabe({ ...basis, alter: 66, rentenalter: 60 });
    expect(e.rentenalter).toBe(67);
    expect(berechne({ ...basis, alter: 66, rentenalter: 60 }).jahre).toBe(1);
  });

  it("liefert für ungültige Eingaben endliche Ergebnisse", () => {
    const r = berechne({ ...basis, sparrate: Number.NaN, startkapital: Number.NaN, rendite: Number.NaN });
    expect(Number.isFinite(r.endkapital)).toBe(true);
    expect(r.endkapital).toBe(0);
  });
});

describe("Grobe monatliche Auszahlung", () => {
  it("verteilt das Kapital gleichmäßig auf die Monate bis zum Endalter", () => {
    expect(monatlicheAuszahlung(216_000, 67, 85)).toBeCloseTo(1000, 9);
    expect(monatlicheAuszahlung(180_000, 70, 85)).toBeCloseTo(1000, 9);
  });

  it("liefert 0 statt unsinniger Werte", () => {
    expect(monatlicheAuszahlung(0, 67, 85)).toBe(0);
    expect(monatlicheAuszahlung(-500, 67, 85)).toBe(0);
    expect(monatlicheAuszahlung(100_000, 85, 85)).toBe(0);
    expect(monatlicheAuszahlung(100_000, 90, 85)).toBe(0);
    expect(monatlicheAuszahlung(Number.NaN, 67, 85)).toBe(0);
  });
});

describe("Renditeszenarien", () => {
  it("drei Szenarien, aufsteigend sortiert, mittleres entspricht direkter Rechnung", () => {
    const s = berechneSzenarien({ ...basis, kosten: 0.01 });
    expect(s.map((x) => x.szenario.id)).toEqual(["vorsichtig", "mittel", "optimistisch"]);
    expect(s[0]!.ergebnis.endkapital).toBeLessThan(s[1]!.ergebnis.endkapital);
    expect(s[1]!.ergebnis.endkapital).toBeLessThan(s[2]!.ergebnis.endkapital);
    expect(s[1]!.ergebnis.endkapital).toBeCloseTo(
      berechne({ ...basis, kosten: 0.01, rendite: s[1]!.szenario.renditePa }).endkapital,
      9,
    );
  });
});

describe("Zulagen nach Altersvorsorgereformgesetz (§§ 84–86 EStG n. F.)", () => {
  const z = (eigenbeitragJahr: number, kinder = 0, berufseinsteigerbonus = false) =>
    berechneZulage({ eigenbeitragJahr, kinder, berufseinsteigerbonus });

  it("unter 120 Euro Mindesteigenbeitrag gibt es keine Zulage", () => {
    expect(z(119.99, 2, true)).toMatchObject({ mindesteigenbeitragErfuellt: false, gesamt: 0 });
  });

  it("Grundzulage: 50 % bis 360 Euro, 25 % von 360,01 bis 1.800 Euro", () => {
    expect(z(120).grundzulage).toBe(60);
    expect(z(360).grundzulage).toBe(180);
    expect(z(1200).grundzulage).toBe(180 + 210);
    expect(z(1800).grundzulage).toBe(540);
    expect(z(5000).grundzulage).toBe(540);
    expect(maxGrundzulage()).toBe(540);
  });

  it("Kinderzulage: 100 % der Beiträge, höchstens 300 Euro je Kind", () => {
    expect(z(200, 1).kinderzulage).toBe(200);
    expect(z(300, 2).kinderzulage).toBe(600);
    expect(z(1800, 3).kinderzulage).toBe(900);
  });

  it("Berufseinsteigerbonus: einmalig 200 Euro", () => {
    expect(z(360, 0, true).gesamt).toBe(380);
  });

  it("Regelwerk-Zuordnung nach Beitragsjahr", () => {
    expect(regelwerkFuerBeitragsjahr(2026).id).toBe("riester-bis-2026");
    expect(regelwerkFuerBeitragsjahr(2027).id).toBe(reform2027.id);
  });

  it("Rechner: Zulagen fließen nur bei aktivierter Förderung ein", () => {
    const ohne = berechne({ ...basis, sparrate: 150 });
    const mit = berechne({ ...basis, sparrate: 150, foerderung: { aktiv: true, kinder: 0, kindergeldJahre: 0 } });
    expect(ohne.zulagen).toBe(0);
    expect(mit.zulagen).toBeCloseTo(540 * 37, 6);
    expect(mit.endkapital).toBeCloseTo(ohne.endkapital + 540 * 37, 6);
    expect(mit.wertzuwachs).toBeCloseTo(0, 6);
  });

  it("Rechner: Kinderzulage nur für die Jahre mit Kindergeld, Bonus nur unter 25 im ersten Jahr", () => {
    const r = berechne({
      ...basis,
      alter: 24,
      rentenalter: 60,
      sparrate: 30, // 360 Euro im Jahr
      foerderung: { aktiv: true, kinder: 2, kindergeldJahre: 10 },
    });
    expect(r.zulageErstesJahr).toBe(180 + 600 + 200);
    expect(r.zulagen).toBeCloseTo(36 * 180 + 10 * 600 + 200, 6);
    const ohneBonus = berechne({ ...basis, alter: 25, sparrate: 30, foerderung: { aktiv: true, kinder: 0, kindergeldJahre: 0 } });
    expect(ohneBonus.zulageErstesJahr).toBe(180);
  });
});

describe("Formatierung", () => {
  it("Euro und Prozent im deutschen Format", () => {
    expect(euro(1234567.4).replace(/\s/g, " ")).toBe("1.234.567 €");
    expect(euro(-0.2).replace(/\s/g, " ")).toBe("0 €");
    expect(prozent(0.0125).replace(/\s/g, " ")).toBe("1,25 %");
  });
});
