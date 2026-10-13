/**
 * Zentrale Marken- und Seitenkonfiguration.
 *
 * WICHTIG: "RenteKannMehr" ist noch nicht markenrechtlich geprüft. Vor dem Livegang sind Marken- und
 * Domainrecherche erforderlich. Unternehmensangaben (Betreiber, Anschrift,
 * Registernummern) sind bewusst NICHT hinterlegt – sie werden nicht erfunden,
 * sondern müssen anhand der tatsächlichen Unternehmensstruktur ergänzt werden.
 */
export const site = {
  name: "RenteKannMehr",
  /** Der Name in zwei Teilen für die Wortmarke: der zweite Teil wird farbig gesetzt. */
  nameTeile: ["Rente", "KannMehr"],
  claim: "Private Altersvorsorge, verständlich erklärt",
  beschreibung:
    "Unabhängige Finanzbildung zur privaten Altersvorsorge in Deutschland: Reform 2027 verstehen, Beispielrechnungen erstellen, Möglichkeiten einordnen.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:5550").replace(/\/$/, ""),
  sprache: "de-DE",
  /** Redaktioneller Stand der fachlichen Inhalte (ISO-Datum). */
  inhaltsstand: "2026-10-11",
  /** Solange false, zeigen Impressum & Co. gut sichtbare Platzhalter-Hinweise. */
  betreiberdatenVollstaendig: false,
} as const;
