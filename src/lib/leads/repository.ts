import { promises as fs } from "node:fs";
import path from "node:path";
import type { Lead } from "./types";

/**
 * Integrationsgrenze „Lead-Speicher“.
 *
 * Aktuell gibt es zwei Implementierungen:
 *   - FileLeadRepository: JSON-Datei unter ./data/leads.json. NUR für lokale
 *     Entwicklung oder einen einzelnen Server gedacht (kein Locking über
 *     Prozesse, keine Verschlüsselung at rest, kein Rollenmodell).
 *   - kein Speicher (LEAD_STORE=none bzw. Produktion ohne Konfiguration):
 *     Die API lehnt Anfragen offen ab, statt einen Erfolg vorzutäuschen.
 *
 * Für den Produktivbetrieb ist eine Datenbank mit Zugriffsbeschränkung,
 * Verschlüsselung und automatischer Löschung anzubinden (siehe
 * docs/BETRIEB-UND-RECHT.md). Dazu genügt eine weitere Klasse, die dieses
 * Interface erfüllt.
 */
export interface LeadRepository {
  speichere(lead: Lead): Promise<void>;
  aktualisiere(lead: Lead): Promise<void>;
  findeNachIdempotenzSchluessel(schluessel: string): Promise<Lead | null>;
  /** Jüngste Anfrage derselben E-Mail an denselben Empfänger seit `seitIso`. */
  findeAktuelleAnfrage(email: string, empfaengerId: string, seitIso: string): Promise<Lead | null>;
}

export class FileLeadRepository implements LeadRepository {
  private warteschlange: Promise<unknown> = Promise.resolve();

  constructor(private readonly datei: string) {}

  private async lese(): Promise<Lead[]> {
    try {
      return JSON.parse(await fs.readFile(this.datei, "utf8")) as Lead[];
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw e;
    }
  }

  private async schreibe(leads: Lead[]): Promise<void> {
    await fs.mkdir(path.dirname(this.datei), { recursive: true });
    const tmp = `${this.datei}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(leads, null, 2), { encoding: "utf8", mode: 0o600 });
    await fs.rename(tmp, this.datei);
  }

  /** Serialisiert Schreibzugriffe innerhalb des Prozesses. */
  private exklusiv<T>(aufgabe: () => Promise<T>): Promise<T> {
    const lauf = this.warteschlange.then(aufgabe, aufgabe);
    this.warteschlange = lauf.catch(() => undefined);
    return lauf;
  }

  speichere(lead: Lead): Promise<void> {
    return this.exklusiv(async () => {
      const leads = await this.lese();
      leads.push(lead);
      await this.schreibe(leads);
    });
  }

  aktualisiere(lead: Lead): Promise<void> {
    return this.exklusiv(async () => {
      const leads = await this.lese();
      const i = leads.findIndex((l) => l.id === lead.id);
      if (i === -1) throw new Error("lead_nicht_gefunden");
      leads[i] = lead;
      await this.schreibe(leads);
    });
  }

  async findeNachIdempotenzSchluessel(schluessel: string): Promise<Lead | null> {
    return (await this.lese()).find((l) => l.idempotenzSchluessel === schluessel) ?? null;
  }

  async findeAktuelleAnfrage(email: string, empfaengerId: string, seitIso: string): Promise<Lead | null> {
    return (
      (await this.lese()).find(
        (l) =>
          l.kontakt.email === email &&
          l.empfaengerId === empfaengerId &&
          l.status !== "geloescht" &&
          l.erstelltAm >= seitIso,
      ) ?? null
    );
  }
}

let instanz: LeadRepository | null | undefined;

/** Liefert den konfigurierten Speicher oder null, wenn keiner verfügbar ist. */
export function leadRepository(): LeadRepository | null {
  if (instanz !== undefined) return instanz;
  const modus = process.env.LEAD_STORE ?? (process.env.NODE_ENV === "production" ? "none" : "file");
  // Der Pfad darf nicht vom Startverzeichnis des Prozesses abhängen – sonst landen
  // personenbezogene Daten womöglich in einem fremden Ordner.
  const datei =
    process.env.LEAD_STORE_PATH ?? path.join(process.env.PROJEKT_VERZEICHNIS ?? process.cwd(), "data", "leads.json");
  instanz = modus === "file" ? new FileLeadRepository(datei) : null;
  return instanz;
}
