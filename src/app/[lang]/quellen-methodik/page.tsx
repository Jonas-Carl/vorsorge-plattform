import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/Bausteine";
import { reform2027, regelwerke } from "@/config/foerderung";
import { quellen } from "@/config/quellen";
import { site } from "@/config/site";
import { szenarien } from "@/config/szenarien";
import { alternativen, istSprache, pfad, type Lang, type LangParams } from "@/i18n";
import { datum, prozent } from "@/lib/format";

const T = {
  de: {
    metaTitel: "Quellen und Rechenwege",
    metaText:
      "Woher unsere Aussagen kommen, welche amtlichen Quellen wir nutzen und wie der Rechner genau rechnet.",
    eyebrow: "Quellen & Rechenwege",
    titel: "Woher unsere Aussagen und Zahlen kommen",
    heroText:
      "Was wir über Gesetze sagen, belegen wir mit amtlichen Quellen. Wie wir rechnen, zeigen wir offen: mit Formeln und Annahmen.",
    krume: "Quellen & Rechenwege",
    regelnTitel: "Unsere Regeln beim Schreiben",
    regeln: [
      ["Erst das Gesetz.", "Wie viel Zuschuss es gibt und wer ihn bekommt, prüfen wir direkt am Gesetzestext im Bundesgesetzblatt. Wir verlassen uns nicht auf Zusammenfassungen."],
      ["Wir sagen, was schon gilt.", "Wir trennen drei Dinge: Recht, das heute gilt. Regeln, die schon verkündet sind, aber noch nicht angewendet werden. Und Punkte, die noch offen sind."],
      ["Ein Ort für alle Zahlen.", "Alle Förderwerte auf dieser Seite kommen aus einer einzigen zentralen Liste. Jede Änderung daran wird festgehalten. Ändert sich das Recht, ändern sich alle Seiten gleichzeitig."],
      ["Das Datum steht dabei.", "Jede Seite mit Erklärungen nennt den Tag, an dem wir sie geprüft haben."],
      ["Keine Versprechen.", "Wir sagen keinen Gewinn voraus. Und wir sichern dir keinen Zuschuss zu."],
    ],
    regelwerkeTitel: "Diese Regelwerke nutzen wir",
    spalten: { regelwerk: "Regelwerk", status: "Stand", jahre: "Gilt für Beitragsjahre", geprueft: "Geprüft am" },
    statusGeltend: "Gilt heute",
    statusVerkuendet: "Verkündet, wird noch nicht angewendet",
    bis: (j: number) => `bis ${j}`,
    ab: (j: number) => `ab ${j}`,
    riester:
      "Die bisherige Riester-Förderung rechnen wir nicht für dich persönlich aus. Sie hängt vom Einkommen des Vorjahres ab. Und nach deinem Einkommen fragen wir nicht.",
    rechnerTitel: "So rechnet der Rechner",
    zeilen: {
      zeit: ["Zeitschritte", "Der Rechner rechnet Monat für Monat. Die Zahl der Monate ist: (Rentenbeginn − Alter) × 12."],
      einzahlung: ["Einzahlung", "Immer am Anfang des Monats (das nennt man „vorschüssig“)."],
      rendite: ["Rendite (Gewinn pro Jahr)", "Gemeint ist die effektive Jahresrendite vor Kosten. Für einen Monat gilt: Monatsfaktor = (1 + Jahresrendite)"],
      kosten: ["Laufende Kosten", "Ein Anteil des Vermögens pro Jahr. Für einen Monat gilt: Monatsfaktor = (1 − Kosten)"],
      kostenNach: ", angewendet am Ende des Monats. Sonst werden nirgends Kosten abgezogen.",
      wirkung: ["Was die Kosten ausmachen", "Endkapital ohne Kosten − Endkapital mit Kosten. Alles andere bleibt dabei gleich."],
      dynamik: ["Steigender Sparbetrag", "Der Sparbetrag steigt jeweils nach 12 Monaten um den Prozentsatz, den du gewählt hast."],
      kaufkraft: ["Kaufkraft (was das Geld später wert ist)", "nominales Kapital ÷ (1 + Inflation)"],
      jahre: "Jahre",
      zulagen: ["Zuschüsse vom Staat (Zulagen)", "Nach §§ 84–86 EStG in der Fassung, die ab 2027 gilt. Zur Vereinfachung schreiben wir den Zuschuss am Ende jedes Beitragsjahres gut. Wir nehmen an, dass die Regeln gleich bleiben."],
      nicht: ["Das rechnet der Rechner nicht mit", "Steuern, Sozialabgaben, Sonderausgabenabzug (Steuervorteil für Beiträge), Abschluss- und Wechselkosten, die Auszahlungsphase und Kursschwankungen."],
    },
    startTitel: "Die Startwerte im einfachen Rechner",
    start: (kosten: string) =>
      `Im einfachen Rechner sind die Kosten auf ${kosten} pro Jahr voreingestellt. Der Grund: Mehr darf das Standarddepot laut Gesetz nicht kosten. Die Zuschüsse vom Staat sind von Anfang an mitgerechnet. Unter „Mehr einstellen“ kannst du sie ausschalten.`,
    szenarienTitel: "Die drei Beispiele für das Wachstum",
    stufen: { vorsichtig: "Wenig", mittel: "Mittel", optimistisch: "Viel" },
    szenarienVor: "Die drei Stufen sind ausgedachte Rechenannahmen. Sie stehen an einer zentralen Stelle: ",
    szenarienNach:
      " pro Jahr vor Kosten. Sie stammen nicht von einer bestimmten Geldanlage. Sie sind keine Vorhersage. In echt kann es deutlich anders kommen. Du kannst auch Geld verlieren.",
    qsTitel: "So prüfen wir den Rechner",
    qs: "Die Rechenlogik ist vom sichtbaren Teil der Seite getrennt. Automatische Tests prüfen sie. Geprüft wird unter anderem: Stimmt das Ergebnis mit der geschlossenen Rentenendwertformel überein? Was passiert bei 0 % Rendite? Bei sehr kurzen und sehr langen Laufzeiten? Dazu kommen Kosten, Inflation, die Grenzen der Eingaben und alle Stufen der Zulagenberechnung.",
    mehrVor: "Ausführlich erklärt: ",
    mehrLink: "Welche Annahmen stecken hinter unseren Berechnungen?",
    quellenTitel: "Alle Quellen",
    veroeffentlicht: "veröffentlicht am",
    abgerufen: "abgerufen am",
    genutztFuer: "Genutzt für:",
    gueltigkeit: "Gültigkeit:",
    fehlerVor: "Fehler gefunden? Schreib uns über die ",
    fehlerLink: "Kontaktseite",
    fehlerNach: ". Wir prüfen das und bessern es aus.",
  },
  en: {
    metaTitel: "Sources and methods",
    metaText:
      "Where our statements come from, which official sources we use and exactly how the calculator works.",
    eyebrow: "Sources & methods",
    titel: "Where our statements and numbers come from",
    heroText:
      "What we say about the law is backed by official sources. How we calculate is shown openly: with formulas and assumptions.",
    krume: "Sources & methods",
    regelnTitel: "Our rules for writing",
    regeln: [
      ["The law first.", "How much allowance there is and who gets it: we check this directly in the legal text in the Federal Law Gazette (Bundesgesetzblatt). We do not rely on summaries."],
      ["We say what already applies.", "We keep three things apart: law that applies today. Rules that have been published but are not applied yet. And points that are still open."],
      ["One place for all numbers.", "All allowance figures on this site come from one single central list. Every change to it is recorded. If the law changes, all pages change at the same time."],
      ["The date is shown.", "Every page with explanations names the day we checked it."],
      ["No promises.", "We do not predict any return. And we do not guarantee you any allowance."],
    ],
    regelwerkeTitel: "The sets of rules we use",
    spalten: { regelwerk: "Set of rules", status: "Status", jahre: "Applies to contribution years", geprueft: "Checked on" },
    statusGeltend: "Applies today",
    statusVerkuendet: "Published, not applied yet",
    bis: (j: number) => `until ${j}`,
    ab: (j: number) => `from ${j}`,
    riester:
      "We do not work out the previous Riester allowance for you personally. It depends on your income in the year before. And we do not ask about your income.",
    rechnerTitel: "How the calculator works",
    zeilen: {
      zeit: ["Time steps", "The calculator goes month by month. The number of months is: (retirement age − age) × 12."],
      einzahlung: ["Deposit", "Always at the start of the month (paid in advance)."],
      rendite: ["Return (gain per year)", "This means the effective annual return before costs. For one month: monthly factor = (1 + annual return)"],
      kosten: ["Running costs", "A share of the savings per year. For one month: monthly factor = (1 − costs)"],
      kostenNach: ", applied at the end of the month. Costs are not taken off anywhere else.",
      wirkung: ["What the costs add up to", "End capital without costs − end capital with costs. Everything else stays the same."],
      dynamik: ["Rising savings amount", "The savings amount goes up after every 12 months by the percentage you chose."],
      kaufkraft: ["Purchasing power (what the money is worth later)", "nominal capital ÷ (1 + inflation)"],
      jahre: "years",
      zulagen: ["State allowances (Zulagen)", "Under §§ 84–86 EStG (German Income Tax Act) in the version that applies from 2027. To keep it simple, we credit the allowance at the end of each contribution year. We assume the rules stay the same."],
      nicht: ["What the calculator leaves out", "Taxes, social security contributions, the special-expenses deduction (a tax benefit for contributions), sign-up and switching costs, the payout phase and price swings."],
    },
    startTitel: "The starting values in the simple calculator",
    start: (kosten: string) =>
      `In the simple calculator, costs are preset to ${kosten} per year. The reason: by law, the standard account (Standarddepot) must not cost more than that. The state allowances are included from the start. You can switch them off under “More settings”.`,
    szenarienTitel: "The three growth examples",
    stufen: { vorsichtig: "A little", mittel: "Medium", optimistisch: "A lot" },
    szenarienVor: "The three levels are made-up assumptions for the calculation. They are set in one central place: ",
    szenarienNach:
      " per year before costs. They are not taken from any particular investment. They are not a forecast. Real results can be very different. You can also lose money.",
    qsTitel: "How we check the calculator",
    qs: "The calculation logic is kept separate from the visible part of the site. Automated tests check it. Among other things they check: does the result match the closed formula for the future value of an annuity? What happens at a 0% return? With very short and very long periods? They also cover costs, inflation, the limits of the inputs and every step of the allowance calculation.",
    mehrVor: "Explained in detail: ",
    mehrLink: "Which assumptions are behind our calculations?",
    quellenTitel: "All sources",
    veroeffentlicht: "published on",
    abgerufen: "accessed on",
    genutztFuer: "Used for:",
    gueltigkeit: "Validity:",
    fehlerVor: "Found a mistake? Write to us via the ",
    fehlerLink: "contact page",
    fehlerNach: ". We will check it and correct it.",
  },
} satisfies Record<Lang, unknown>;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  return {
    title: T[lang].metaTitel,
    description: T[lang].metaText,
    alternates: alternativen(lang, "/quellen-methodik"),
  };
}

export default async function QuellenSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = T[lang];
  const z = t.zeilen;
  const kostenStandard = prozent(reform2027.produkt.effektivkostenStandarddepotMax, 2, lang);

  return (
    <>
      <PageHero
        lang={lang}
        eyebrow={t.eyebrow}
        titel={t.titel}
        text={t.heroText}
        krumen={[{ label: t.krume }]}
        stand={site.inhaltsstand}
      />

      <section className="section" aria-labelledby="redaktion-titel">
        <div className="wrap prose">
          <h2 id="redaktion-titel" style={{ marginTop: 0 }}>{t.regelnTitel}</h2>
          <ul>
            {t.regeln.map(([fett, text]) => (
              <li key={fett}><strong>{fett}</strong> {text}</li>
            ))}
          </ul>

          <h2>{t.regelwerkeTitel}</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{t.spalten.regelwerk}</th>
                  <th scope="col">{t.spalten.status}</th>
                  <th scope="col">{t.spalten.jahre}</th>
                  <th scope="col">{t.spalten.geprueft}</th>
                </tr>
              </thead>
              <tbody>
                {regelwerke.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" lang="de">{r.bezeichnung}</th>
                    <td>{r.status === "geltend" ? t.statusGeltend : t.statusVerkuendet}</td>
                    <td>{r.gueltigBisBeitragsjahr ? t.bis(r.gueltigBisBeitragsjahr) : t.ab(r.gueltigAbBeitragsjahr)}</td>
                    <td>{datum(r.geprueftAm, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>{t.riester}</p>

          <h2>{t.rechnerTitel}</h2>
          <div className="table-wrap">
            <table>
              <tbody>
                <tr><th scope="row">{z.zeit[0]}</th><td>{z.zeit[1]}</td></tr>
                <tr><th scope="row">{z.einzahlung[0]}</th><td>{z.einzahlung[1]}</td></tr>
                <tr><th scope="row">{z.rendite[0]}</th><td>{z.rendite[1]}<sup>1/12</sup></td></tr>
                <tr><th scope="row">{z.kosten[0]}</th><td>{z.kosten[1]}<sup>1/12</sup>{z.kostenNach}</td></tr>
                <tr><th scope="row">{z.wirkung[0]}</th><td>{z.wirkung[1]}</td></tr>
                <tr><th scope="row">{z.dynamik[0]}</th><td>{z.dynamik[1]}</td></tr>
                <tr><th scope="row">{z.kaufkraft[0]}</th><td>{z.kaufkraft[1]}<sup>{z.jahre}</sup></td></tr>
                <tr><th scope="row">{z.zulagen[0]}</th><td>{z.zulagen[1]}</td></tr>
                <tr><th scope="row">{z.nicht[0]}</th><td>{z.nicht[1]}</td></tr>
              </tbody>
            </table>
          </div>

          <h3>{t.startTitel}</h3>
          <p>{t.start(kostenStandard)}</p>

          <h3>{t.szenarienTitel}</h3>
          <p>
            {t.szenarienVor}
            {szenarien.map((s) => `${t.stufen[s.id]} ${prozent(s.renditePa, 2, lang)}`).join(", ")}
            {t.szenarienNach}
          </p>

          <h3>{t.qsTitel}</h3>
          <p>{t.qs}</p>
          <p>
            {t.mehrVor}
            <Link href={pfad(lang, "/wissen/annahmen-hinter-den-berechnungen")}>{t.mehrLink}</Link>
          </p>

          <h2>{t.quellenTitel}</h2>
        </div>
        <div className="wrap" style={{ marginTop: "var(--s-5)" }}>
          <div className="grid">
            {quellen.map((q) => (
              <article key={q.id} className="card" id={q.id}>
                <span className="tag" lang="de">{q.art}</span>
                <h3 style={{ fontSize: "var(--text-lg)" }}>
                  <a href={q.url} target="_blank" rel="noopener noreferrer" lang="de">{q.titel}</a>
                </h3>
                <p className="small muted">
                  <span lang="de">{q.herausgeber}</span>
                  {q.veroeffentlicht && <> · {t.veroeffentlicht} {datum(q.veroeffentlicht, lang)}</>} · {t.abgerufen} {datum(q.abgerufen, lang)}
                </p>
                <p className="small"><strong>{t.genutztFuer}</strong> <span lang="de">{q.aussage}</span></p>
                <p className="small"><strong>{t.gueltigkeit}</strong> <span lang="de">{q.gueltigkeit}</span></p>
              </article>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: "var(--s-5)" }}>
            {t.fehlerVor}
            <Link href={pfad(lang, "/kontakt")}>{t.fehlerLink}</Link>
            {t.fehlerNach}
          </p>
        </div>
      </section>
    </>
  );
}
