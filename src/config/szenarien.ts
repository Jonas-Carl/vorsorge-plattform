/**
 * Konfigurierbare Rechenannahmen des Rechners.
 *
 * Die Renditeszenarien sind HYPOTHETISCHE Rechenannahmen. Sie sind weder
 * Prognosen noch Zusagen. Tatsächliche Kapitalmarktentwicklungen können deutlich
 * abweichen – auch Verluste sind möglich.
 */
export type Szenario = {
  id: "vorsichtig" | "mittel" | "optimistisch";
  label: string;
  /** Angenommene jährliche Rendite vor Kosten (effektiv, z. B. 0.05 = 5 %). */
  renditePa: number;
  beschreibung: string;
};

export const szenarien: Szenario[] = [
  {
    id: "vorsichtig",
    label: "Vorsichtig",
    renditePa: 0.02,
    beschreibung: "Rechenannahme mit niedriger Wertentwicklung.",
  },
  {
    id: "mittel",
    label: "Mittel",
    renditePa: 0.05,
    beschreibung: "Rechenannahme mit mittlerer Wertentwicklung.",
  },
  {
    id: "optimistisch",
    label: "Optimistisch",
    renditePa: 0.07,
    beschreibung: "Rechenannahme mit hoher Wertentwicklung.",
  },
];

/** Zulässige Eingabebereiche und Startwerte des Rechners. */
export const grenzen = {
  alter: { min: 18, max: 66, start: 32, schritt: 1 },
  rentenalter: { min: 60, max: 70, start: 67, schritt: 1 },
  sparrate: { min: 5, max: 1000, start: 100, schritt: 5 },
  startkapital: { min: 0, max: 500_000, start: 0, schritt: 500 },
  rendite: { min: 0, max: 0.1, start: 0.05, schritt: 0.0025 },
  kosten: { min: 0, max: 0.03, start: 0.01, schritt: 0.001 },
  dynamik: { min: 0, max: 0.05, start: 0, schritt: 0.005 },
  inflation: { min: 0, max: 0.05, start: 0.02, schritt: 0.0025 },
  kinder: { min: 0, max: 6, start: 0, schritt: 1 },
  kindergeldJahre: { min: 0, max: 25, start: 10, schritt: 1 },
} as const;

/** Erstes Beitragsjahr, das der Förderbereich des Rechners modelliert. */
export const ERSTES_MODELLIERTES_BEITRAGSJAHR = 2027;
