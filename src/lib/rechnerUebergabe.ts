"use client";

import type { RechnerEingabe } from "@/lib/rechner";

/**
 * Übergibt die Eingaben des Kurzrechners (Startseite) an den vollständigen
 * Rechner – ausschließlich im Arbeitsspeicher der laufenden Sitzung. Es wird
 * nichts auf dem Endgerät gespeichert und nichts in die URL geschrieben.
 */
let uebergabe: Partial<RechnerEingabe> | null = null;

export function merkeEingabe(e: Partial<RechnerEingabe>) {
  uebergabe = e;
}

export function holeEingabe(): Partial<RechnerEingabe> | null {
  const e = uebergabe;
  uebergabe = null;
  return e;
}
