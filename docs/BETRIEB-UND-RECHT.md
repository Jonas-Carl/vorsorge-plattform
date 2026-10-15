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
   **Stand 15.10.2026 (Entscheidung der Betreiber):** Tippgeber-Modell. Es werden nur Anfragen
   (Leads) an den jeweiligen Träger weitergegeben, Vergütung nur je weitergegebener Anfrage,
   keine abschlussabhängige Provision, keine Produktberatung. Deshalb steht im Impressum keine
   Aufsichtsbehörde. **Vor dem Livegang von der IHK Osnabrück-Emsland-Grafschaft Bentheim oder
   einer Fachanwältin/einem Fachanwalt bestätigen lassen.**
2. **Datenschutz.** Rechtsgrundlagen für Anfrage und Weitergabe, Einwilligungstext,
   Auftragsverarbeitungsverträge (Hosting, Datenbank, E-Mail), ggf. gemeinsame Verantwortlichkeit
   oder Übermittlungsvereinbarung mit Partnern, Löschkonzept (180 Tage sind ein Vorschlag im Code),
   Verzeichnis von Verarbeitungstätigkeiten, ggf. Datenschutz-Folgenabschätzung,
   vollständige Datenschutzerklärung.
   **Stand 15.10.2026:** Datenschutzerklärung ausgefüllt (Verantwortlicher RenteKannMehr GbR, Hosting bei
   Hostinger, E-Mail-Kontakt, Löschfrist 180 Tage, kein Datenschutzbeauftragter, Aufsicht LfD Niedersachsen).
   Noch zu klären: Anschrift von Hostinger mit dem AV-Vertrag abgleichen und den AV-Vertrag im
   Hostinger-Konto abschließen/ablegen (gilt auch für das E-Mail-Postfach, ebenfalls Hostinger); prüfen, ob das
   Anfrageformular auf dem gewählten Hostinger-Tarif überhaupt läuft (braucht Node.js).
   **Lead-Weitergabe an Partner (vor dem ersten Partner erledigen):** schriftlicher Vertrag mit jedem
   Partner (nur Nutzung für die Kontaktaufnahme, keine Weitergabe/Weiterverkauf, eigene Information der
   Person nach Art. 14 DSGVO, Löschung, Umgang mit Widerruf, Telefonkontakt nur bei gewähltem Kontaktweg);
   Einwilligungsnachweis wird je Anfrage gespeichert (Wortlaut, Version, Zeitpunkt). Abrechnungsunterlagen
   gegenüber Partnern unterliegen eigenen Aufbewahrungsfristen (§ 147 AO) – dafür reichen Vorgangsnummer
   und Datum, nicht die vollständigen Kontaktdaten.
3. **Telefonische Kontaktaufnahme (§ 7 UWG).** Anforderungen an die Einwilligung in
   Werbeanrufe und deren Dokumentation, auch für Anrufe durch Partner.
4. **Werbung und Transparenz (UWG, MStV).** Die Hinweise zur Vergütung sind bewusst knapp gehalten:
   eine kurze Seite „Unabhängigkeit & Partner“ (`/transparenz`, verlinkt in der Fußzeile und im
   Anfrageformular), ein Satz „kommerzielles Angebot“ auf „Über uns“ und das Feld „Vergütung“ je Partner.
   Prüfen, ob das für § 5a UWG reicht. Außerdem: Kennzeichnung kommerzieller Inhalte, Aussagen zu
   Förderung und Rendite in Anzeigen, Werberichtlinien der Plattformen für Finanzprodukte.
5. **Impressum (§ 5 DDG, § 18 MStV)** und Betreiberangaben – derzeit Platzhalter.
6. **TDDDG.** Solange nur die Einwilligungsauswahl gespeichert wird, ist kein Banner vorgesehen;
   bei Einführung von Analyse oder Werbe-Pixeln ist eine Einwilligungslösung nötig.
7. **Barrierefreiheit (BFSG).** Prüfen, ob das Angebot erfasst ist; unabhängig davon vollständiges
   WCAG-2.2-AA-Audit inkl. Screenreader-Test und ggf. Erklärung zur Barrierefreiheit.
8. **Marke.** Recherche zu „RenteKannMehr“ (DPMA/EUIPO, Domains, Firmennamen) – auch zu ähnlichen
   Schreibweisen wie „Rente kann mehr“. Der frühere Arbeitstitel war „Morgenplan“.
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
| „Das steht schon fest“ | bis 300 € extra je Kind, ab 25 € im Monat, solange Kindergeld | § 85 Abs. 1 EStG n. F.: „Für jedes Kind … 100 Prozent der im Beitragsjahr bis zu einer Höhe von 1 800 Euro geleisteten Altersvorsorgebeiträge …, höchstens 300 Euro pro Kind“ – Bemessung je Kind, keine Aufteilung auf mehrere Kinder (Wortlaut am 14.10.2026 über die NWB-Datenbank abgeglichen, nicht am BGBl.-PDF) | Wortlaut abgeglichen; am BGBl. bestätigen |
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
| Artikel „Rentenlücke“, Kasten „Kostenlose Hilfe“ | „Rede kostenlos mit deinem persönlichen Berater … ganz unverbindlich“ | Aussage über Partner, die es noch nicht gibt; gilt nur, wenn jeder Partner ein kostenloses, unverbindliches Erstgespräch anbietet | mit Partnern vertraglich sicherstellen |
| Rechner | Geplante Kinder: Extra-Geld 18 Jahre ab dem angegebenen Alter bei der Geburt | eigene Annahme (Kindergeld mindestens bis 18, § 32 Abs. 3 und 4 EStG); Zuordnung zwischen den Eltern nicht abgebildet | Annahme bestätigen |
| Rechner | Rendite 2 % / 6 % / 10 %, voreingestellt 6 % (vor 1 % Kosten); 10 % liegt deutlich über langjährigen Durchschnitten breit gestreuter Aktienfonds | eigene Beispielwerte, kein Gesetzeswert | Annahme bestätigen |
| Kopfbereich, Karte „Deine Möglichkeiten“ | „Mögliches Endvermögen“ 568.527 € mit Balkendiagramm | Rechenlogik des Rechners mit eigenem Beispiel: 150 € im Monat ab 20 bis 67 (47 Jahre), 7 % Wachstum vor 1 % Kosten, Zuschuss inkl. Start-Bonus eingerechnet; Annahmen stehen in der Karte, gekennzeichnet als unverbindliches Beispiel. 7 % liegt zwischen der mittleren (6 %) und der höchsten Stufe (10 %) des Rechners | Annahme bestätigen (Werbung mit optimistischer Rendite) |
| Kopfbereich, Förderkarte 1 | bis zu 540 € im Jahr: 50 Cent je Euro bis 360 €, danach 25 Cent bis 1.800 € (ab 2027) | § 84 EStG n. F. | fachlich zu prüfen |
| Kopfbereich, Förderkarte 2 | bis zu 300 € pro Kind und Jahr, solange es Kindergeld gibt | § 85 EStG n. F. | fachlich zu prüfen |
| Kopfbereich, Förderkarte 3 | 200 € Start-Bonus, einmalig unter 25 | § 84 Satz 2 EStG n. F. | fachlich zu prüfen |
| Rechner, „Voraussichtlich“ | grobe monatliche Auszahlung: Endkapital gleichmäßig bis 85 verteilt, ohne Wachstum, vor Steuern | eigene Vereinfachung; 85 = frühestes Ende eines Auszahlungsplans (AltZertG n. F.) | fachlich zu prüfen |
| Rechner, Schnellwahl | 10 € Minimum, 150 € voller Zuschuss, 570 € Maximum im Monat | § 86, § 84 EStG n. F., Einzahlungsgrenze 6.840 € im Jahr – jeweils durch 12 | fachlich zu prüfen |
| Häufige Fragen | unter 18 möglich, Eltern müssen zustimmen | kein Mindestalter im Reformgesetz; Zustimmung nach allgemeinem Vertragsrecht | fachlich zu prüfen |
