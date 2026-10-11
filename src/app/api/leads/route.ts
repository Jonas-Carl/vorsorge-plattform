import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { leadRepository } from "@/lib/leads/repository";
import { verarbeiteAnfrage } from "@/lib/leads/service";
import type { LeadAnfrage, LeadAntwort } from "@/lib/leads/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Einfaches Ratenlimit pro Prozess (max. 5 Anfragen / 10 Minuten je Herkunft).
 * Die IP wird nur als gesalzener Hash im Arbeitsspeicher gehalten und nie
 * gespeichert. Für mehrere Instanzen ist ein zentrales Limit (z. B. am Edge)
 * erforderlich – siehe docs/BETRIEB-UND-RECHT.md.
 */
const FENSTER_MS = 10 * 60 * 1000;
const MAX_ANFRAGEN = 5;
const SALZ = Math.random().toString(36).slice(2);
const zugriffe = new Map<string, number[]>();

function limitErreicht(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unbekannt";
  const schluessel = createHash("sha256").update(SALZ + ip).digest("hex");
  const jetzt = Date.now();
  const liste = (zugriffe.get(schluessel) ?? []).filter((t) => jetzt - t < FENSTER_MS);
  liste.push(jetzt);
  zugriffe.set(schluessel, liste);
  if (zugriffe.size > 5000) zugriffe.clear();
  return liste.length > MAX_ANFRAGEN;
}

const antworte = (antwort: LeadAntwort, status: number) => NextResponse.json(antwort, { status });

export async function POST(req: Request) {
  // Nur gleiche Herkunft und JSON – schützt vor Cross-Site-Formularen.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return antworte({ ok: false, code: "ungueltige_anfrage", meldung: "Anfrage nicht zulässig." }, 403);
  }
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return antworte({ ok: false, code: "ungueltige_anfrage", meldung: "Anfrage nicht zulässig." }, 415);
  }
  if (limitErreicht(req)) {
    return antworte(
      { ok: false, code: "zu_viele_anfragen", meldung: "Zu viele Anfragen in kurzer Zeit. Bitte versuche es in einigen Minuten erneut." },
      429,
    );
  }

  let roh: LeadAnfrage;
  try {
    const textBody = await req.text();
    if (textBody.length > 10_000) throw new Error("zu_gross");
    roh = JSON.parse(textBody) as LeadAnfrage;
    if (!roh || typeof roh !== "object" || Array.isArray(roh)) throw new Error("kein_objekt");
  } catch {
    return antworte({ ok: false, code: "ungueltige_anfrage", meldung: "Die Anfrage konnte nicht gelesen werden." }, 400);
  }

  try {
    const { status, antwort } = await verarbeiteAnfrage(roh, { repo: leadRepository() });
    return antworte(antwort, status);
  } catch (e) {
    // Keine personenbezogenen Daten ins Log.
    console.error("[leads] Verarbeitung fehlgeschlagen:", e instanceof Error ? e.message : "unbekannt");
    return antworte(
      {
        ok: false,
        code: "serverfehler",
        meldung: "Deine Anfrage konnte wegen eines technischen Fehlers nicht gespeichert werden. Bitte versuche es später erneut.",
      },
      500,
    );
  }
}
