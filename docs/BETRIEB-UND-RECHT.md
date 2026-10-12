# Betrieb, Datenverarbeitung und offene Punkte vor dem Livegang

Stand: 11. Oktober 2026. Dieses Dokument ersetzt keine Rechtsberatung. Es listet, was die
Anwendung tatsächlich tut, und was vor einem Produktivstart noch zu klären oder zu bauen ist.

## 1. Was fertig ist, was vorläufig ist

| Status | Bestandteil |
| --- | --- |
| Fertig | Startseite, Rechner inkl. Szenarien/Kosten/Inflation, Förderbereich (Regelwerk ab 2027), Reform-Guide, 18 Wissensartikel, 6 Landingpages, Quellen- und Methodikseite, Transparenzseite, Formular mit Client- und Server-Validierung, SEO-Grundlage (Metadaten, Canonicals, Sitemap, strukturierte Daten, OG-Bild) |
| Vorläufig | Partnerbereich (4 Platzhalter), Lead-Speicher als JSON-Datei, Ratenlimit im Prozess, Rechtsseiten mit Platzhaltern, Arbeitstitel der Marke |
| Nicht gebaut | Datenbank, internes Werkzeug zur Lead-Bearbeitung, automatische Löschung, Bestätigungs-E-Mails, Analyse-Anbindung, A/B-Test-Ausspielung, Retry-Queue für Partner-Übergaben |

## 2. Datenverarbeitung der Anwendung

| Vorgang | Daten | Speicherort | Weitergabe |
| --- | --- | --- | --- |
| Seitenaufruf | Verbindungsdaten laut Hosting | Hosting-Logs (noch nicht festgelegt) | – |
| Rechner | Eingaben | nur Browser-Arbeitsspeicher | keine |
| Cookie-Einstellungen | Auswahl + Zeitpunkt | `localStorage` (`mp-einwilligung-v1`) | keine |
| Kampagnenzuordnung | `utm_source/medium/campaign`, Einstiegspfad | Arbeitsspeicher; nur bei Anfrage im Lead | keine |
| Kontaktanfrage | Name, E-Mail, Kontaktweg, Anliegen; optional Telefon, Zeit, Nachricht; Bestätigungswortlaut mit Version und Zeitpunkt | Lead-Speicher | nur an den gewählten, aktiven Partner |
| Missbrauchsschutz | IP als gesalzener Hash | Arbeitsspeicher, max. 10 Minuten | keine |

Nicht gespeichert werden: IP-Adresse und User-Agent im Lead, Rechnereingaben, Klick-IDs.

### Lead-Status und Auswertungsstufen

Status (`Lead.status`): eingegangen → validiert → zur Übermittlung bereit → erfolgreich übermittelt /
Übermittlung fehlgeschlagen → in Bearbeitung → abgeschlossen → gelöscht.

Die wirtschaftlichen Stufen stehen getrennt in `Lead.wertschoepfung` und werden nur mit Beleg gesetzt:

| Stufe | Wann sie gesetzt wird | Aktuell |
| --- | --- | --- |
| Besuch, Rechnernutzung | Ereignisse in `analytics.ts` | definiert, kein Dienst angebunden |
| Kontaktanfrage | Lead gespeichert | automatisch |
| Qualifizierter Lead (`qualifiziertAm`) | nach Prüfung gegen die mit dem Partner vereinbarte Definition | manuell – **Definition je Partner noch festzulegen** (Vorschlag: erreichbar, eigenes Interesse bestätigt, im Zielgebiet/Zielgruppe des Partners, kein Duplikat) |
| Erfolgreiche Übergabe (`uebergebenAm`) | Partner-Endpunkt bestätigt mit HTTP 2xx | automatisch |
| Vermittlung, Vertragsabschluss, Abrechnung | Rückmeldung des Partners | Felder vorhanden, Rückkanal nicht gebaut |

## 3. Integrationsgrenzen

- **Lead-Speicher** (`src/lib/leads/repository.ts`): Interface `LeadRepository`. Die Datei-Variante
  ist nur für Entwicklung/Einzelserver. In Produktion ist ohne `LEAD_STORE=file` kein Speicher
  aktiv; das Formular meldet dann offen, dass keine Anfragen angenommen werden.
- **Partner-Übergabe** (`src/lib/leads/delivery.ts`): generischer, HMAC-signierter HTTPS-Webhook.
  Es sind keine Partner-Endpunkte hinterlegt. Das Payload-Format ist ein Vorschlag und mit dem
  ersten Partner abzustimmen.
- **Analyse** (`src/lib/analytics.ts`): `registriereAdapter()` – erst nach rechtlicher Prüfung.

## 4. Benötigte Umgebungsvariablen und Konten

| Variable | Zweck | Pflicht |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonicals, Sitemap, Open Graph | Produktion: ja |
| `LEAD_STORE` | `file` oder `none` | nein (Standard: dev `file`, prod `none`) |
| `LEAD_STORE_PATH` | abweichender Pfad der Lead-Datei | nein |
| `PARTNER_WEBHOOK_SECRET`, `PARTNER_WEBHOOK_URL_<ID>` | Partner-Übergabe | erst mit aktivem Webhook-Partner |

Externe Konten für den Livegang: Hosting, Domain, Datenbank, transaktionaler E-Mail-Versand;
später ggf. Werbekonten (Meta, Google Ads) und ein einwilligungsbasiertes Analysewerkzeug.

## 5. Offene rechtliche Prüfungen (vor Produktivstart)

1. **Erlaubnispflicht der Tätigkeit.** Zu klären ist, ob das konkrete Modell reine
   Kontaktvermittlung („Tippgeber“) bleibt oder als Versicherungs- bzw. Finanzanlagenvermittlung
   einzuordnen ist (§§ 34d, 34f GewO, ggf. KWG/WpIG). Maßgeblich sind der tatsächliche Ablauf,
   die Inhalte der Anfrage und die Vergütung – insbesondere Abschlussprovisionen. Die
   Bezeichnung „Finanzbildung“ entscheidet das nicht.
2. **Datenschutz.** Rechtsgrundlagen für Anfrage und Weitergabe, Einwilligungstext,
   Auftragsverarbeitungsverträge (Hosting, Datenbank, E-Mail), ggf. gemeinsame Verantwortlichkeit
   oder Übermittlungsvereinbarung mit Partnern, Löschkonzept (180 Tage sind ein Vorschlag im Code),
   Verzeichnis von Verarbeitungstätigkeiten, ggf. Datenschutz-Folgenabschätzung,
   vollständige Datenschutzerklärung.
3. **Telefonische Kontaktaufnahme (§ 7 UWG).** Anforderungen an die Einwilligung in
   Werbeanrufe und deren Dokumentation, auch für Anrufe durch Partner.
4. **Werbung und Transparenz (UWG, MStV).** Kennzeichnung kommerzieller Inhalte, Aussagen zu
   Förderung und Rendite in Anzeigen, Werberichtlinien der Plattformen für Finanzprodukte.
5. **Impressum (§ 5 DDG, § 18 MStV)** und Betreiberangaben – derzeit Platzhalter.
6. **TDDDG.** Solange nur die Einwilligungsauswahl gespeichert wird, ist kein Banner vorgesehen;
   bei Einführung von Analyse oder Werbe-Pixeln ist eine Einwilligungslösung nötig.
7. **Barrierefreiheit (BFSG).** Prüfen, ob das Angebot erfasst ist; unabhängig davon vollständiges
   WCAG-2.2-AA-Audit inkl. Screenreader-Test und ggf. Erklärung zur Barrierefreiheit.
8. **Marke.** Recherche zu „Morgenplan“ (DPMA/EUIPO, Domains, Firmennamen).
9. **Übersetzungen.** Die englische und die französische Fassung sind Arbeitsübersetzungen ohne
   muttersprachliche oder juristische Prüfung. Das betrifft auch den Bestätigungswortlaut im
   Anfrageformular, der als Einwilligungsnachweis gespeichert wird. Vor dem Start prüfen lassen.
10. **Fachliche Abnahme.** Die Förderparameter wurden am Gesetzestext (BGBl. 2026 I Nr. 156)
   geprüft. Vor dem Start sollte eine steuerlich fachkundige Person Artikel und Rechner abnehmen;
   danach bei jeder Rechtsänderung und mindestens jährlich.

## 6. Technische Aufgaben vor dem Livegang

- Datenbank mit Verschlüsselung, Rollen und Zugriffsprotokoll anbinden; automatische Löschung nach `loeschenBis`.
- Zentrales Ratenlimit und Bot-Schutz am Edge (das Prozesslimit greift nicht über mehrere Instanzen).
- Content-Security-Policy mit Nonces ergänzen (übrige Sicherheits-Header sind gesetzt).
- Bestätigungs-E-Mail an Anfragende, ggf. Double-Opt-in.
- Internes Werkzeug: Leads einsehen, qualifizieren, löschen, Übergaben wiederholen.
- Monitoring für fehlgeschlagene Übergaben; Wiederholungslogik.
- Lasttest, Lighthouse-/Core-Web-Vitals-Messung auf der Zielinfrastruktur.

## 7. Startseite: Aussagen für die fachliche Prüfung

Diese Zahlen und rechtlichen Aussagen stehen auf der Startseite. Sie stammen aus
`src/config/foerderung.ts` und wurden am Gesetzestext (BGBl. 2026 I Nr. 156) abgeglichen.
Eine Abnahme durch eine steuerlich oder rechtlich fachkundige Person steht noch aus.
Beim Redesign der Startseite wurde keine dieser Aussagen inhaltlich verändert.

| Wo auf der Startseite | Aussage | Grundlage | Status |
| --- | --- | --- | --- |
| „Das steht schon fest“ | 50 Cent Zuschuss je Euro für die ersten 360 € im Jahr | § 84 EStG n. F. | fachlich zu prüfen |
| „Das steht schon fest“ | 25 Cent je weiterem Euro bis 1.800 €, höchstens 540 € | § 84 EStG n. F. | fachlich zu prüfen |
| „Das steht schon fest“ | bis 300 € extra je Kind, ab 25 € im Monat, solange Kindergeld | § 85 EStG n. F. | fachlich zu prüfen |
| „Das steht schon fest“ | 200 € Start-Bonus unter 25, einmalig | § 84 Satz 2 EStG n. F. | fachlich zu prüfen |
| „Das steht schon fest“ | mindestens 120 € im Jahr sparen | § 86 EStG n. F. | fachlich zu prüfen |
| „Das steht schon fest“ | höchstens 1 % Kosten beim Standard-Depot | § 2a Abs. 2 AltZertG n. F. | fachlich zu prüfen |
| „Das steht schon fest“ | Regeln gelten ab 1. Januar 2027 | Art. 14 des Gesetzes | fachlich zu prüfen |
| „So funktioniert es“ | Auszahlung ab 65 Jahren | § 1 Abs. 1 Nr. 2 AltZertG n. F. (Ausnahme: früherer Bezug einer gesetzlichen Altersrente) | fachlich zu prüfen |
| „Passt das zu mir?“ | Selbstständige ab 2027 förderberechtigt | § 10a Abs. 1 Satz 5 EStG n. F. (mit weiteren Voraussetzungen) | fachlich zu prüfen |
| „Passt das zu mir?“ | Riester-Verträge laufen weiter, Wechsel freiwillig | Auskunft ZfA / DRV | fachlich zu prüfen |
| „Passt das zu mir?“ | Schüler ohne Job und Rentner meist nicht berechtigt | abgeleitet aus § 10a EStG | fachlich zu prüfen |
| Rechner, „Das steht fest“ | Zuschuss wird standardmäßig eingerechnet | Annahme: Person ist förderberechtigt | fachlich zu prüfen |
| Rechner | Extra-Geld für Kinder für 10 Jahre gerechnet | eigene Annahme, kein Gesetzeswert | Annahme bestätigen |
| Rechner | Wachstum 2 % / 5 % / 7 % | eigene Beispielwerte, kein Gesetzeswert | Annahme bestätigen |
| Rechner, „Das weiß niemand vorher“ | grobe monatliche Auszahlung: Endkapital gleichmäßig bis 85 verteilt, ohne Wachstum, vor Steuern | eigene Vereinfachung; 85 = frühestes Ende eines Auszahlungsplans (AltZertG n. F.) | fachlich zu prüfen |
| Rechner, Schnellwahl | 10 € Minimum, 150 € voller Zuschuss, 570 € Maximum im Monat | § 86, § 84 EStG n. F., Einzahlungsgrenze 6.840 € im Jahr – jeweils durch 12 | fachlich zu prüfen |
| Häufige Fragen | unter 18 möglich, Eltern müssen zustimmen | kein Mindestalter im Reformgesetz; Zustimmung nach allgemeinem Vertragsrecht | fachlich zu prüfen |
