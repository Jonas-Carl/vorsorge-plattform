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
  /** Angenommene jährliche Rendite vor Kosten (effektiv, z. B. 0.06 = 6 %). */
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
    renditePa: 0.06,
    beschreibung: "Rechenannahme mit mittlerer Wertentwicklung.",
  },
  {
    id: "optimistisch",
    label: "Optimistisch",
    renditePa: 0.1,
    beschreibung: "Rechenannahme mit hoher Wertentwicklung.",
  },
];

/** Zulässige Eingabebereiche und Startwerte des Rechners. */
export const grenzen = {
  // Ab 15: Das Gesetz kennt kein Mindestalter; wer z. B. als Azubi in die
  // Rentenversicherung einzahlt, ist auch unter 18 förderberechtigt.
  alter: { min: 15, max: 66, start: 32, schritt: 1 },
  rentenalter: { min: 60, max: 70, start: 67, schritt: 1 },
  sparrate: { min: 10, max: 1000, start: 100, schritt: 5 },
  startkapital: { min: 0, max: 500_000, start: 0, schritt: 500 },
  rendite: { min: 0, max: 0.1, start: 0.06, schritt: 0.0025 },
  kosten: { min: 0, max: 0.03, start: 0.01, schritt: 0.001 },
  dynamik: { min: 0, max: 0.05, start: 0, schritt: 0.005 },
  inflation: { min: 0, max: 0.05, start: 0.02, schritt: 0.0025 },
  kinder: { min: 0, max: 6, start: 0, schritt: 1 },
  kindergeldJahre: { min: 0, max: 25, start: 10, schritt: 1 },
  geplanteKinder: { min: 0, max: 4, start: 0, schritt: 1 },
  /** Spätere Erhöhungen des Sparbetrags („ab 25 dann 150 € im Monat“). */
  erhoehungen: { min: 0, max: 3, abAlterMin: 15, abAlterMax: 100 },
  /** Eigenes Alter bei der Geburt eines geplanten Kindes. Nur die Jahre bis zum Rentenbeginn wirken sich aus. */
  geburtsalter: { min: 15, max: 100, schritt: 1 },
} as const;

/**
 * Geplante Kinder: Für so viele Jahre ab der Geburt rechnet der Rechner das Extra-Geld für Kinder
 * ein. Kindergeld gibt es mindestens bis 18, in Ausbildung oder Studium oft bis 25 – wir nehmen
 * vorsichtig 18 an.
 */
export const KINDERGELD_JAHRE_GEPLANT = 18;

/** Erstes Beitragsjahr, das der Förderbereich des Rechners modelliert. */
export const ERSTES_MODELLIERTES_BEITRAGSJAHR = 2027;
