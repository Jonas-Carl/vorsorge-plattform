import { describe, expect, it, vi } from "vitest";
import { partner } from "@/config/partner";
import type { LeadRepository } from "./repository";
import { verarbeiteAnfrage } from "./service";
import type { Lead, LeadAnfrage } from "./types";
import { pruefeAnfrage } from "./validation";

function speicher(): LeadRepository & { leads: Lead[] } {
  const leads: Lead[] = [];
  return {
    leads,
    async speichere(l) { leads.push(structuredClone(l)); },
    async aktualisiere(l) { leads[leads.findIndex((x) => x.id === l.id)] = structuredClone(l); },
    async findeNachIdempotenzSchluessel(s) { return leads.find((l) => l.idempotenzSchluessel === s) ?? null; },
    async findeAktuelleAnfrage(email, empf, seit) {
      return leads.find((l) => l.kontakt.email === email && l.empfaengerId === empf && l.erstelltAm >= seit) ?? null;
    },
  };
}

// Fiktive Testdaten (reservierte Beispiel-Domain) – keine echten Personen.
const gueltig = (): LeadAnfrage => ({
  vorname: "Test",
  nachname: "Beispiel",
  email: "test@example.org",
  kontaktweg: "email",
  kontaktzeit: "egal",
  anliegen: "allgemein",
  empfaengerId: "plattform",
  einwilligung: true,
  idempotenzSchluessel: "3f2b8c1e-5a4d-4e6f-9a1b-2c3d4e5f6a7b",
  ausfuelldauerMs: 9000,
  website: "",
});

describe("Validierung der Kontaktanfrage", () => {
  it("akzeptiert eine vollständige Anfrage", () => {
    expect(pruefeAnfrage(gueltig()).ok).toBe(true);
  });

  it("meldet alle Pflichtfelder", () => {
    const r = pruefeAnfrage({});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.fehler).sort()).toEqual(
        ["anliegen", "einwilligung", "email", "empfaengerId", "kontaktweg", "kontaktzeit", "nachname", "vorname"].sort(),
      );
    }
  });

  it.each(["kein-at-zeichen", "a@b", "a b@example.org", "@example.org", "name@domain."])(
    "lehnt ungültige E-Mail-Adresse ab: %s",
    (email) => {
      const r = pruefeAnfrage({ ...gueltig(), email });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.fehler.email).toBeTruthy();
    },
  );

  it("verlangt die Bestätigung – auch 'true' als Text genügt nicht", () => {
    for (const einwilligung of [false, undefined, "true", 1]) {
      const r = pruefeAnfrage({ ...gueltig(), einwilligung });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.fehler.einwilligung).toBeTruthy();
    }
  });

  it("Telefon ist nur beim Kontaktweg Telefon Pflicht", () => {
    const r = pruefeAnfrage({ ...gueltig(), kontaktweg: "telefon" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fehler.telefon).toBeTruthy();
    expect(pruefeAnfrage({ ...gueltig(), kontaktweg: "telefon", telefon: "+49 541 000000" }).ok).toBe(true);
  });

  it("Partnerauswahl: Platzhalter und unbekannte Partner sind nicht auswählbar", () => {
    for (const empfaengerId of [partner[0]!.id, "gibt-es-nicht", ""]) {
      const r = pruefeAnfrage({ ...gueltig(), empfaengerId });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.fehler.empfaengerId).toBeTruthy();
    }
  });

  it("übernimmt nur unkritische Kampagnenparameter und Pfade ohne Query", () => {
    const r = pruefeAnfrage({
      ...gueltig(),
      attribution: { quelle: "instagram", kampagne: "<script>", einstieg: "/rechner?email=a@b.de", medium: "paid" },
    });
    expect(r.ok && r.daten.attribution).toEqual({ quelle: "instagram", medium: "paid", kampagne: undefined, einstieg: undefined });
  });
});

describe("Verarbeitung der Kontaktanfrage", () => {
  it("speichert eine Plattform-Anfrage und meldet ehrlich: keine Weitergabe", async () => {
    const repo = speicher();
    const { status, antwort } = await verarbeiteAnfrage(gueltig(), { repo });
    expect(status).toBe(201);
    expect(antwort).toMatchObject({ ok: true, uebermittlung: "nicht_vorgesehen", duplikat: false });
    expect(repo.leads).toHaveLength(1);
    const lead = repo.leads[0]!;
    expect(lead.status).toBe("in_bearbeitung");
    expect(lead.einwilligungen[0]).toMatchObject({ empfaenger: "plattform", zweck: "kontaktaufnahme_und_weitergabe" });
    expect(lead.einwilligungen[0]!.wortlaut).toContain("nicht an andere weitergegeben");
    expect(lead.sprache).toBe("de");
    expect(new Date(lead.loeschenBis).getTime()).toBeGreaterThan(Date.now());
    // Datenminimierung: keine technischen Fingerabdrücke im Datensatz
    expect(JSON.stringify(lead)).not.toMatch(/ip|userAgent/i);
  });

  it("englische Anfragen erhalten englische Meldungen und einen englischen Bestätigungswortlaut", async () => {
    const repo = speicher();
    const fehler = pruefeAnfrage({ sprache: "en" });
    expect(!fehler.ok && fehler.fehler.email).toBe("Please enter your email address.");
    await verarbeiteAnfrage({ ...gueltig(), sprache: "en" }, { repo });
    expect(repo.leads[0]!.sprache).toBe("en");
    expect(repo.leads[0]!.einwilligungen[0]!.wortlaut).toContain("not passed on to anyone else");
    const ohne = await verarbeiteAnfrage({ ...gueltig(), sprache: "en" }, { repo: null });
    expect(ohne.antwort).toMatchObject({ ok: false, meldung: expect.stringContaining("not saved") });
  });

  it("ohne Speicher wird kein Erfolg vorgetäuscht", async () => {
    const { status, antwort } = await verarbeiteAnfrage(gueltig(), { repo: null });
    expect(status).toBe(503);
    expect(antwort).toMatchObject({ ok: false, code: "speicher_nicht_verfuegbar" });
  });

  it("doppelte Anfragen erzeugen keinen zweiten Datensatz", async () => {
    const repo = speicher();
    await verarbeiteAnfrage(gueltig(), { repo });
    const gleicherSchluessel = await verarbeiteAnfrage(gueltig(), { repo });
    const neuerSchluessel = await verarbeiteAnfrage(
      { ...gueltig(), idempotenzSchluessel: "11111111-2222-4333-8444-555555555555" },
      { repo },
    );
    expect(gleicherSchluessel.antwort).toMatchObject({ ok: true, duplikat: true });
    expect(neuerSchluessel.antwort).toMatchObject({ ok: true, duplikat: true });
    expect(repo.leads).toHaveLength(1);
  });

  it("Honeypot und zu schnelles Absenden werden abgelehnt, nichts wird gespeichert", async () => {
    const repo = speicher();
    expect((await verarbeiteAnfrage({ ...gueltig(), website: "http://spam.example" }, { repo })).status).toBe(400);
    expect((await verarbeiteAnfrage({ ...gueltig(), ausfuelldauerMs: 300 }, { repo })).status).toBe(400);
    expect(repo.leads).toHaveLength(0);
  });

  it("Validierungsfehler liefern 422 mit Feldfehlern", async () => {
    const repo = speicher();
    const { status, antwort } = await verarbeiteAnfrage({ ...gueltig(), email: "falsch" }, { repo });
    expect(status).toBe(422);
    expect(antwort).toMatchObject({ ok: false, code: "validierung" });
    expect(repo.leads).toHaveLength(0);
  });

  it("fehlgeschlagene Übergabe wird als fehlgeschlagen gespeichert und gemeldet", async () => {
    const repo = speicher();
    const uebergabe = vi.fn(async () => ({ status: "fehlgeschlagen" as const, fehler: "http_500" }));
    const { antwort } = await verarbeiteAnfrage(gueltig(), { repo, uebergabe });
    expect(antwort).toMatchObject({ ok: true, uebermittlung: "fehlgeschlagen" });
    expect(repo.leads[0]).toMatchObject({
      status: "uebermittlung_fehlgeschlagen",
      uebermittlung: { status: "fehlgeschlagen", versuche: 1, fehler: "http_500" },
    });
    expect(repo.leads[0]!.wertschoepfung.uebergebenAm).toBeUndefined();
  });

  it("erfolgreiche Übergabe setzt Status und Übergabezeitpunkt", async () => {
    const repo = speicher();
    const uebergabe = vi.fn(async () => ({ status: "erfolgreich" as const }));
    await verarbeiteAnfrage(gueltig(), { repo, uebergabe });
    expect(repo.leads[0]!.status).toBe("erfolgreich_uebermittelt");
    expect(repo.leads[0]!.wertschoepfung.uebergebenAm).toBeTruthy();
    // Übergeben ≠ qualifiziert ≠ Vertrag
    expect(repo.leads[0]!.wertschoepfung.qualifiziertAm).toBeUndefined();
    expect(repo.leads[0]!.wertschoepfung.vertragBestaetigtAm).toBeUndefined();
  });
});
