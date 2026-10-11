"use client";

import type { Attribution } from "@/lib/leads/types";

/**
 * Datenschutzfreundliche Mess-Grundlage.
 *
 * - Es ist KEIN Analyse- oder Werbedienst angebunden. `track()` sendet nichts an
 *   Dritte; ohne Einwilligung und ohne registrierten Adapter passiert gar nichts.
 * - Ereignisse enthalten niemals personenbezogene Daten oder Rechnereingaben.
 * - Kampagnenparameter (utm_*) werden nur im Arbeitsspeicher der laufenden
 *   Sitzung gehalten – es wird dafür nichts auf dem Endgerät gespeichert.
 *
 * Die Trichterstufen sind bewusst getrennt: Ein Besuch ist keine Rechnernutzung,
 * eine Anfrage kein qualifizierter Lead, eine Übergabe kein Vertragsabschluss.
 * Stufen ab „qualifizierter Lead“ entstehen serverseitig (siehe Lead.wertschoepfung).
 */
export type Ereignis =
  | "seitenaufruf"
  | "rechner_gestartet"
  | "rechner_ergebnis_gesehen"
  | "erklaerung_geoeffnet"
  | "anfrage_begonnen"
  | "anfrage_abgeschickt"
  | "anfrage_fehlgeschlagen";

export type Einstellungen = { statistik: boolean; entschiedenAm: string | null };

const SCHLUESSEL = "mp-einwilligung-v1";
const STANDARD: Einstellungen = { statistik: false, entschiedenAm: null };

/** Die gespeicherte Auswahl selbst ist technisch erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). */
export function leseEinstellungen(): Einstellungen {
  try {
    const roh = window.localStorage.getItem(SCHLUESSEL);
    if (!roh) return STANDARD;
    const p = JSON.parse(roh) as Partial<Einstellungen>;
    return { statistik: p.statistik === true, entschiedenAm: typeof p.entschiedenAm === "string" ? p.entschiedenAm : null };
  } catch {
    return STANDARD;
  }
}

export function speichereEinstellungen(statistik: boolean): Einstellungen {
  const e: Einstellungen = { statistik, entschiedenAm: new Date().toISOString() };
  try {
    window.localStorage.setItem(SCHLUESSEL, JSON.stringify(e));
  } catch {
    /* Speicher nicht verfügbar – Auswahl gilt dann nur für diese Seite. */
  }
  return e;
}

type Adapter = (ereignis: Ereignis, eigenschaften: Record<string, string | number | boolean>) => void;
let adapter: Adapter | null = null;

/** Später: Anbindung eines Analysewerkzeugs – nur nach rechtlicher Prüfung. */
export function registriereAdapter(a: Adapter) {
  adapter = a;
}

export function track(ereignis: Ereignis, eigenschaften: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined" || !adapter) return;
  if (!leseEinstellungen().statistik) return;
  adapter(ereignis, eigenschaften);
}

let attribution: Attribution | null = null;

/** Liest utm_* einmalig aus der aktuellen URL (nur Arbeitsspeicher). */
export function merkeAttribution(): Attribution {
  if (attribution || typeof window === "undefined") return attribution ?? {};
  const p = new URLSearchParams(window.location.search);
  const feld = (k: string) => p.get(k)?.slice(0, 80) || undefined;
  attribution = {
    quelle: feld("utm_source"),
    medium: feld("utm_medium"),
    kampagne: feld("utm_campaign"),
    einstieg: window.location.pathname,
  };
  return attribution;
}

/**
 * Grundlage für spätere A/B-Tests. Varianten dürfen sich nur in Darstellung und
 * Formulierung unterscheiden – nie in Transparenz, Risikohinweisen oder Preis-
 * bzw. Förderaussagen. Aktuell ist kein Test aktiv.
 */
export const experimente: { id: string; varianten: string[]; aktiv: boolean }[] = [];
