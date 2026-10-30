/**
 * Werte für die grobe Schätzung des Steuervorteils (Sonderausgabenabzug § 10a EStG).
 *
 * Einkommensteuertarif § 32a EStG für 2026 (Steuerfortentwicklungsgesetz vom 23.12.2024).
 * Bei einer Tarifänderung hier anpassen und `stand` aktualisieren.
 */
export const steuer = {
  stand: "Tarif 2026",
  tarif: {
    grundfreibetrag: 12_348,
    zone2Bis: 17_799,
    zone3Bis: 69_878,
    zone4Bis: 277_825,
  },
  /** Werbungskosten-Pauschbetrag für Arbeitnehmer (§ 9a EStG). */
  werbungskostenPauschbetrag: 1_230,
  /** Sonderausgaben-Pauschbetrag (§ 10c EStG). */
  sonderausgabenPauschbetrag: 36,
  /**
   * Abziehbare Sozialversicherung, stark vereinfacht: Rentenversicherung (Arbeitnehmeranteil)
   * bis zur Beitragsbemessungsgrenze, Kranken- und Pflegeversicherung (Basisanteil) bis zu deren Grenze.
   */
  vorsorge: {
    rvSatz: 0.093,
    rvGrenze: 101_400,
    kvPvSatz: 0.1,
    kvPvGrenze: 69_750,
  },
} as const;
