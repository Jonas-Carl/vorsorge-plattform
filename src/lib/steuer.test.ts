import { describe, expect, it } from "vitest";
import { einkommensteuer, steuervorteilJahr, zvEAusBrutto } from "./steuer";

describe("Einkommensteuer (Grundtabelle 2026)", () => {
  it("ist bis zum Grundfreibetrag null", () => {
    expect(einkommensteuer(12_348)).toBe(0);
  });
  it("trifft die Zonengrenzen stetig", () => {
    expect(einkommensteuer(17_799)).toBe(1_034);
    expect(einkommensteuer(69_878)).toBe(18_213);
    expect(einkommensteuer(100_000)).toBe(30_864);
  });
});

describe("Steuervorteil", () => {
  it("ist ohne Einkommensangabe null", () => {
    expect(steuervorteilJahr(0, 1_800, 540)).toBe(0);
  });
  it("ist bei kleinem Einkommen null, weil die Zulage mehr bringt", () => {
    expect(steuervorteilJahr(20_000, 1_200, 450)).toBe(0);
  });
  it("entsteht bei höherem Einkommen und ist kleiner als die volle Steuerersparnis", () => {
    const v = steuervorteilJahr(70_000, 1_800, 540);
    expect(v).toBeGreaterThan(100);
    expect(v).toBeLessThan(1_000);
  });
  it("berechnet das zu versteuernde Einkommen kleiner als das Brutto", () => {
    expect(zvEAusBrutto(50_000)).toBeLessThan(50_000);
    expect(zvEAusBrutto(0)).toBe(0);
  });
});
