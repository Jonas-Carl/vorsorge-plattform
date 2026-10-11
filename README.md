# Morgenplan – Finanzbildungsplattform zur privaten Altersvorsorge

> „Morgenplan“ ist ein **Arbeitstitel** (zentral in `src/config/site.ts`). Marken- und Domainprüfung stehen aus.

Next.js-Anwendung mit Altersvorsorgerechner, Reform-Guide 2027, Wissensbereich (18 Artikel),
Partner-Platzhaltern und einem Lead-System mit ehrlichem Übermittlungsstatus.

## Lokal starten

```bash
npm install
npm run dev        # http://localhost:5550
```

Weitere Befehle:

| Befehl | Zweck |
| --- | --- |
| `npm run test` | Unit-Tests (Rechner, Zulagen, Lead-Validierung und -Verarbeitung) |
| `npm run typecheck` | TypeScript-Prüfung |
| `npm run lint` | ESLint (Next-Regeln) |
| `npm run build` / `npm run start` | Produktions-Build / Start |

Umgebungsvariablen: siehe `.env.example`. Für die lokale Entwicklung ist keine Datei nötig.

## Architektur in Kürze

| Bereich | Ort | Hinweis |
| --- | --- | --- |
| Design-Tokens, Komponenten-CSS | `src/app/globals.css` | Farben, Typografie, Abstände als CSS-Variablen |
| Marke, Navigation | `src/config/site.ts` | Name, URL, Inhaltsstand, Schalter `betreiberdatenVollstaendig` |
| **Förderregeln (versioniert)** | `src/config/foerderung.ts` | einzige Quelle aller gesetzlichen Zahlen |
| Quellenregister | `src/config/quellen.ts` | Titel, Herausgeber, URL, Abruf, Aussage, Gültigkeit |
| Szenarien, Eingabegrenzen | `src/config/szenarien.ts` | Renditeannahmen sind konfigurierbar |
| **Partner** | `src/config/partner.ts` | 4 Platzhalter; Aktivierung per Konfiguration |
| Rechenlogik | `src/lib/rechner.ts`, `src/lib/foerderung.ts` | ohne UI, getestet in `rechner.test.ts` |
| Rechner-UI | `src/components/Calculator.tsx`, `NumberField.tsx`, `GrowthChart.tsx` | eigene SVG-Diagramme, keine Chart-Bibliothek |
| Inhalte | `src/content/` | Artikel als typisierte Daten; Zahlen kommen aus der Förder-Konfiguration |
| Lead-System | `src/lib/leads/`, `src/app/api/leads/route.ts` | Validierung, Speicher-Interface, Partner-Übergabe |
| Messung/Einwilligung | `src/lib/analytics.ts` | kein Dienst angebunden; ohne Einwilligung No-op |

### Bewusste Entscheidungen

- **Kein CMS, keine Datenbank, keine UI-/Chart-Bibliothek** in Version 1: wenige Abhängigkeiten
  (`next`, `react`), schnelle Seiten, alles statisch vorgerendert außer `/api/leads`.
- **Förderwerte nie im UI hartcodiert:** Texte, Tabellen und Rechner lesen aus `foerderung.ts`.
  Ändert sich das Recht, wird ein neues Regelwerk ergänzt.
- **Rechner läuft nur im Browser.** Eingaben verlassen das Gerät nicht.
- **Ehrliche Zustände:** Ohne Speicher antwortet die API mit 503 statt mit einem Scheinerfolg;
  eine Partner-Übergabe gilt nur bei bestätigter Annahme (HTTP 2xx) als erfolgreich.

## Zwei Sprachen und einfache Sprache

- Alle Seiten liegen unter `src/app/[lang]/` und sind als `/de/...` und `/en/...` erreichbar; `/` leitet auf `/de` weiter.
- Oberflächentexte: `src/i18n/de.ts` und `src/i18n/en.ts` (gleiche Struktur). Artikel: `src/content/artikel-*.ts` (deutsch) und `artikel-*.en.ts` (englisch).
- Leitlinie für Texte: kurze Sätze, keine Fachwörter ohne Erklärung – ein zehnjähriges Kind soll verstehen, worum es geht. Jeder Artikel hat dafür das Feld `einfach` („Kurz gesagt“).
- Der Rechner (`src/components/Calculator.tsx`) stellt drei Fragen und trennt „Das steht fest“ (Beitrag, gesetzlicher Zuschuss, gesetzlicher Kostendeckel von 1 %) von „Das weiß niemand vorher“ (Wachstum als Beispiel).
- Die englischen Texte sind eine Arbeitsübersetzung; englische Bezeichnungen deutscher Rechtsbegriffe sind nicht amtlich.

## Neue Inhalte

- **Artikel:** Eintrag in `src/content/artikel-a.ts` oder `artikel-b.ts` (Typ `Artikel`).
- **Kampagnen-Landingpage:** Eintrag in `landingpages` (`src/content/index.ts`) → `/themen/<slug>`.
- **Partner aktivieren:** in `src/config/partner.ts` echte Daten eintragen, `status: "aktiv"` und
  `vereinbarung: "abgeschlossen"` setzen. Erst dann ist der Partner im Formular wählbar.
  Für die technische Übergabe `integration: { art: "webhook" }` sowie die Variablen
  `PARTNER_WEBHOOK_URL_<ID>` und `PARTNER_WEBHOOK_SECRET` setzen.

## Deployment

Jede Node-Umgebung, die Next.js ausführt (eigener Server, Container, Vercel o. Ä.):

```bash
npm ci && npm run build && npm run start
```

Vor dem Livegang zwingend: `docs/BETRIEB-UND-RECHT.md` abarbeiten. Solange
`betreiberdatenVollstaendig` in `src/config/site.ts` auf `false` steht, sperrt `robots.txt` die
gesamte Website für Suchmaschinen.
