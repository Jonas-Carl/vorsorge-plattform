/**
 * Zentrales Quellenregister. Jede wesentliche rechtliche oder förderbezogene
 * Aussage der Website verweist über die Quellen-ID auf einen Eintrag hier.
 */
export type Quelle = {
  id: string;
  titel: string;
  herausgeber: string;
  url: string;
  /** ISO-Datum der Veröffentlichung, sofern bekannt. */
  veroeffentlicht?: string;
  /** ISO-Datum, an dem die Redaktion die Quelle zuletzt abgerufen hat. */
  abgerufen: string;
  /** Wofür die Quelle herangezogen wird (relevante Aussage / Textstelle). */
  aussage: string;
  gueltigkeit: string;
  art: "Gesetzestext" | "Amtliche Information" | "Parlamentsdokument";
};

const ABRUF = "2026-10-11";

export const quellen: Quelle[] = [
  {
    id: "bgbl-2026-156",
    titel: "Gesetz zur Reform der steuerlich geförderten privaten Altersvorsorge (Altersvorsorgereformgesetz) vom 26. Mai 2026",
    herausgeber: "Bundesgesetzblatt, BGBl. 2026 I Nr. 156",
    url: "https://www.recht.bund.de/bgbl/1/2026/156/VO.html",
    veroeffentlicht: "2026-05-29",
    abgerufen: ABRUF,
    aussage:
      "Art. 2: § 10a EStG (Sonderausgabenabzug bis 1.800 Euro zzgl. Zulage), § 84 EStG (Grundzulage 50 % bis 360 Euro, 25 % von 360,01 bis 1.800 Euro; einmalig 200 Euro unter 25 Jahren; mittelbar Berechtigte höchstens 175 Euro), § 85 EStG (Kinderzulage 100 % der Beiträge, höchstens 300 Euro je Kind), § 86 EStG (Mindesteigenbeitrag 120 Euro). Art. 6: AltZertG § 1 (Auszahlungsbeginn, Garantiestufen 80/100 %, Auszahlungsplan bis mindestens Alter 85, bis zu 30 % Teilauszahlung, Einzahlungsgrenze 6.840 Euro, Wechselkosten höchstens 150 Euro), § 2a (Effektivkosten Standarddepot höchstens 1,0 %). Art. 14: Inkrafttreten.",
    gueltigkeit:
      "Verkündet am 29. Mai 2026. Die Förder- und Produktregeln (Art. 2, 6, 9, 11–13) treten am 1. Januar 2027 in Kraft, weitere Teile (Art. 3, 4, 7, 10) am 1. Januar 2028.",
    art: "Gesetzestext",
  },
  {
    id: "bundestag-kw13-2026",
    titel: "Bundestag beschließt das Altersvorsorgedepot",
    herausgeber: "Deutscher Bundestag, Textarchiv",
    url: "https://www.bundestag.de/dokumente/textarchiv/2026/kw13-de-altersvorsorge-1156798",
    veroeffentlicht: "2026-03-27",
    abgerufen: ABRUF,
    aussage:
      "Beschluss am 27. März 2026 (Drucksachen 21/4088, 21/4996). Änderungen des Finanzausschusses: höhere Förderquote, Kostendeckel 1 % statt 1,5 % beim Standarddepot, Aufnahme von Selbstständigen und Pflichtmitgliedern berufsständischer Versorgungseinrichtungen, Verordnungsermächtigung für ein Standarddepot in öffentlicher Trägerschaft.",
    gueltigkeit: "Parlamentsbeschluss; maßgeblich ist der verkündete Gesetzestext.",
    art: "Parlamentsdokument",
  },
  {
    id: "bundesregierung-faq",
    titel: "Fragen und Antworten: Private Altersvorsorge reformiert",
    herausgeber: "Presse- und Informationsamt der Bundesregierung",
    url: "https://www.bundesregierung.de/breg-de/aktuelles/reform-private-altersvorsorge-2400072",
    veroeffentlicht: "2026-06-01",
    abgerufen: ABRUF,
    aussage:
      "Zeitlicher Ablauf (Kabinett 17.12.2025, Bundestag 27.03.2026, Bundesrat 08.05.2026), Start der neuen Produkte zum 1. Januar 2027, Überblick über Zulagen, Kostendeckel und Bestandsschutz für Riester-Verträge.",
    gueltigkeit: "Stand der Seite: 1. Juni 2026.",
    art: "Amtliche Information",
  },
  {
    id: "bmf-faq",
    titel: "Fragen und Antworten zur Reform der geförderten privaten Altersvorsorge",
    herausgeber: "Bundesministerium der Finanzen",
    url: "https://www.bundesfinanzministerium.de/Content/DE/FAQ/reform-der-privaten-altersvorsorge.html",
    abgerufen: ABRUF,
    aussage:
      "Erläuterung der beitragsproportionalen Förderung (Grundzulage, Kinderzulage) und des Starts der neuen Produkte. Die Seite war am Abruftag zeitweise nicht erreichbar; alle Zahlen wurden deshalb direkt am Gesetzestext geprüft.",
    gueltigkeit: "Laufend aktualisierte Informationsseite.",
    art: "Amtliche Information",
  },
  {
    id: "drv-reform",
    titel: "Altersvorsorge-Reformgesetz",
    herausgeber: "Deutsche Rentenversicherung",
    url: "https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Moeglichkeiten-der-Altersvorsorge/Altervorsorgereformgesetz",
    abgerufen: ABRUF,
    aussage:
      "Überblick über neue Produktarten, neu förderberechtigte Personengruppen, Bestandsschutz und Wechselmöglichkeit für bestehende Riester-Verträge; Hinweis, dass ein Standarddepot in öffentlicher Trägerschaft möglicherweise erst nach dem 1. Januar 2027 verfügbar ist.",
    gueltigkeit: "Informationsseite nach Zustimmung des Bundesrates am 8. Mai 2026.",
    art: "Amtliche Information",
  },
  {
    id: "zfa-faq",
    titel: "Häufige Fragen (FAQ) der Zentralen Zulagenstelle für Altersvermögen",
    herausgeber: "Deutsche Rentenversicherung Bund – Zentrale Zulagenstelle für Altersvermögen (ZfA)",
    url: "https://riester.deutsche-rentenversicherung.de/DE/FAQ",
    abgerufen: ABRUF,
    aussage:
      "Wahlrecht für Bestandsverträge ab 1. Januar 2027: Wechsel aller bestehenden Riester-Verträge in die neue Fördersystematik oder Verbleib aller Verträge im alten Recht; ein Wechsel zurück ist nicht möglich; Folgen für mittelbar Zulageberechtigte.",
    gueltigkeit: "Laufend aktualisierte FAQ.",
    art: "Amtliche Information",
  },
  {
    id: "estg-geltend",
    titel: "Einkommensteuergesetz (EStG), §§ 10a, 79–99 in der bis 31. Dezember 2026 geltenden Fassung",
    herausgeber: "Bundesministerium der Justiz – Gesetze im Internet",
    url: "https://www.gesetze-im-internet.de/estg/",
    abgerufen: ABRUF,
    aussage:
      "Bisherige Riester-Förderung: Grundzulage 175 Euro, Kinderzulage 185 Euro (Geburt vor 2008) bzw. 300 Euro (Geburt ab 2008), Mindesteigenbeitrag 4 % der maßgebenden Einnahmen des Vorjahres abzüglich Zulagen (mindestens 60 Euro Sockelbetrag), Sonderausgabenabzug bis 2.100 Euro.",
    gueltigkeit: "Geltendes Recht für Beitragsjahre bis einschließlich 2026.",
    art: "Gesetzestext",
  },
];

export function quelle(id: string): Quelle {
  const q = quellen.find((x) => x.id === id);
  if (!q) throw new Error(`Unbekannte Quelle: ${id}`);
  return q;
}
