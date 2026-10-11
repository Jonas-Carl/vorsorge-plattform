import { createHmac } from "node:crypto";
import { EMPFAENGER_PLATTFORM, findePartner, istAuswaehlbar } from "@/config/partner";
import type { Lead, Uebermittlungsstatus } from "./types";

/**
 * Integrationsgrenze „Partner-Übergabe“.
 *
 * Eine Übergabe gilt NUR dann als erfolgreich, wenn der Partner-Endpunkt die
 * Annahme mit HTTP 2xx bestätigt hat. In allen anderen Fällen bleibt der Status
 * „ausstehend“ oder „fehlgeschlagen“ – und genau das erfährt auch der Nutzer.
 *
 * Aktuell ist kein Partner aktiv, es findet also keine Übergabe statt.
 */
export type Uebergabeergebnis = { status: Uebermittlungsstatus; fehler?: string };

function webhookUrl(partnerId: string): string | undefined {
  return process.env[`PARTNER_WEBHOOK_URL_${partnerId.toUpperCase().replace(/-/g, "_")}`];
}

export async function uebergebeLead(lead: Lead): Promise<Uebergabeergebnis> {
  if (lead.empfaengerId === EMPFAENGER_PLATTFORM) return { status: "nicht_vorgesehen" };

  const partner = findePartner(lead.empfaengerId);
  if (!partner || !istAuswaehlbar(partner)) return { status: "fehlgeschlagen", fehler: "partner_nicht_aktiv" };

  // Ohne dokumentierte Einwilligung für genau diesen Empfänger keine Weitergabe.
  if (!lead.einwilligungen.some((e) => e.empfaenger === partner.id)) {
    return { status: "fehlgeschlagen", fehler: "einwilligung_fehlt" };
  }

  if (partner.integration.art !== "webhook") return { status: "ausstehend", fehler: "keine_technische_anbindung" };

  const url = webhookUrl(partner.id);
  const secret = process.env.PARTNER_WEBHOOK_SECRET;
  if (!url || !secret || !url.startsWith("https://")) {
    return { status: "ausstehend", fehler: "webhook_nicht_konfiguriert" };
  }

  // Nur die für die Kontaktaufnahme nötigen Daten verlassen das System.
  const body = JSON.stringify({
    leadId: lead.id,
    erstelltAm: lead.erstelltAm,
    kontakt: lead.kontakt,
    anliegen: lead.anliegen,
    nachricht: lead.nachricht ?? null,
    einwilligung: lead.einwilligungen.find((e) => e.empfaenger === partner.id),
  });
  const signatur = createHmac("sha256", secret).update(body).digest("hex");

  try {
    const antwort = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature-SHA256": signatur,
        "Idempotency-Key": lead.id,
      },
      body,
      signal: AbortSignal.timeout(8000),
      redirect: "error",
    });
    return antwort.ok ? { status: "erfolgreich" } : { status: "fehlgeschlagen", fehler: `http_${antwort.status}` };
  } catch (e) {
    return { status: "fehlgeschlagen", fehler: e instanceof Error && e.name === "TimeoutError" ? "timeout" : "netzwerk" };
  }
}
