import { reform2027, type ReformRegelwerk } from "@/config/foerderung";
import { steuer } from "@/config/steuer";

/**
 * Grobe Schätzung des zusätzlichen Steuervorteils durch den Sonderausgabenabzug.
 *
 * ANNAHMEN (auch auf /quellen-methodik genannt):
 *  - eine alleinstehende Person, Einkünfte nur aus einer Anstellung (Grundtabelle),
 *  - zu versteuerndes Einkommen = Brutto − Pauschbeträge − abziehbare Sozialversicherung (vereinfacht),
 *  - ohne Solidaritätszuschlag und Kirchensteuer,
 *  - Günstigerprüfung wie § 10a EStG: Abzug der eigenen Beiträge (höchstens 1.800 €) zuzüglich Zulage;
 *    ein Vorteil entsteht nur, soweit die Steuerersparnis die Zulage übersteigt.
 */

/** Einkommensteuer nach Grundtabelle § 32a EStG (auf volle Euro abgerundet). */
export function einkommensteuer(zvE: number): number {
  const x = Math.floor(Math.max(0, zvE));
  const t = steuer.tarif;
  let est: number;
  if (x <= t.grundfreibetrag) est = 0;
  else if (x <= t.zone2Bis) {
    const y = (x - t.grundfreibetrag) / 10_000;
    est = (914.51 * y + 1_400) * y;
  } else if (x <= t.zone3Bis) {
    const z = (x - t.zone2Bis) / 10_000;
    est = (173.1 * z + 2_397) * z + 1_034.87;
  } else if (x <= t.zone4Bis) est = 0.42 * x - 11_135.63;
  else est = 0.45 * x - 19_470.38;
  return Math.floor(est);
}

/** Zu versteuerndes Einkommen aus dem Brutto-Jahresgehalt (vereinfacht). */
export function zvEAusBrutto(brutto: number): number {
  const b = Math.max(0, brutto);
  const v = steuer.vorsorge;
  const vorsorge = v.rvSatz * Math.min(b, v.rvGrenze) + v.kvPvSatz * Math.min(b, v.kvPvGrenze);
  return Math.max(0, b - steuer.werbungskostenPauschbetrag - steuer.sonderausgabenPauschbetrag - vorsorge);
}

/** Zusätzlicher Steuervorteil in einem Beitragsjahr (0, wenn die Zulage günstiger ist). */
export function steuervorteilJahr(
  brutto: number,
  eigenbeitragJahr: number,
  zulageJahr: number,
  r: ReformRegelwerk = reform2027,
): number {
  if (brutto <= 0 || eigenbeitragJahr <= 0) return 0;
  const zvE = zvEAusBrutto(brutto);
  const abzug = Math.min(eigenbeitragJahr, r.sonderausgabenHoechstbetrag) + zulageJahr;
  const ersparnis = einkommensteuer(zvE) - einkommensteuer(zvE - abzug);
  return Math.max(0, ersparnis - zulageJahr);
}
