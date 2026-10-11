import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, PlatzhalterHinweis } from "@/components/Bausteine";
import { alternativen, istSprache, pfad, type Lang, type LangParams } from "@/i18n";

const T = {
  de: {
    metaTitel: "Kontakt",
    metaText:
      "So erreichst du uns: bei Fragen zu den Texten, wenn du einen Fehler findest, bei Fragen zum Datenschutz oder wenn du mit uns zusammenarbeiten willst.",
    eyebrow: "Kontakt",
    titel: "So erreichst du uns",
    heroText:
      "Du hast eine Frage zu deinem eigenen Sparen fürs Alter? Dann nutze bitte das Anfrageformular. Für alles andere findest du hier den richtigen Weg.",
    krume: "Kontakt",
    frageTitel: "Fragen zum Sparen fürs Alter",
    frageText: "Du möchtest mehr wissen oder mit jemandem sprechen? Schick uns eine Anfrage. Sie verpflichtet dich zu nichts.",
    frageKnopf: "Frage stellen",
    fehlerTitel: "Fehler oder Hinweise",
    fehlerText: "Du hast einen Fehler im Text gefunden oder eine Angabe ist veraltet? Wir prüfen jeden Hinweis.",
    koopTitel: "Zusammenarbeit und Presse",
    koopText: "Anbieter, Vermittler und Medien erreichen uns hier.",
    platzhalter:
      "Kontaktadressen (E-Mail, Postanschrift, vielleicht Telefon) sind noch nicht eingetragen. Die Platzhalter in eckigen Klammern müssen vor dem Livegang durch die echten Angaben des Betreibers ersetzt werden.",
    datenschutzVor: "Fragen zum Datenschutz (Auskunft, Löschung, Widerruf): siehe ",
    datenschutzLink: "Datenschutz",
  },
  en: {
    metaTitel: "Contact",
    metaText:
      "How to reach us: with questions about the content, if you find a mistake, with privacy questions or if you want to work with us.",
    eyebrow: "Contact",
    titel: "How to reach us",
    heroText:
      "Do you have a question about your own saving for old age? Then please use the request form. For everything else you will find the right way here.",
    krume: "Contact",
    frageTitel: "Questions about saving for old age",
    frageText: "Would you like to know more or talk to someone? Send us a request. It does not commit you to anything.",
    frageKnopf: "Ask a question",
    fehlerTitel: "Mistakes or tips",
    fehlerText: "Have you found a mistake in a text, or is something out of date? We check every tip.",
    koopTitel: "Working together and press",
    koopText: "Providers, brokers and the media can reach us here.",
    platzhalter:
      "Contact addresses (email, postal address, perhaps phone) have not been entered yet. The placeholders in square brackets must be replaced with the operator's real details before the site goes live.",
    datenschutzVor: "Privacy questions (access to your data, deletion, withdrawing consent): see ",
    datenschutzLink: "Privacy",
  },
} satisfies Record<Lang, unknown>;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  return {
    title: T[lang].metaTitel,
    description: T[lang].metaText,
    alternates: alternativen(lang, "/kontakt"),
  };
}

export default async function KontaktSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = T[lang];

  return (
    <>
      <PageHero
        lang={lang}
        eyebrow={t.eyebrow}
        titel={t.titel}
        text={t.heroText}
        krumen={[{ label: t.krume }]}
      />
      <section className="section">
        <div className="wrap stack-lg">
          <div className="grid grid--3">
            <article className="card card--pad">
              <h2 style={{ fontSize: "var(--text-xl)" }}>{t.frageTitel}</h2>
              <p className="small">{t.frageText}</p>
              <Link href={pfad(lang, "/anfrage")} className="btn btn--primary">{t.frageKnopf}</Link>
            </article>
            <article className="card card--pad">
              <h2 style={{ fontSize: "var(--text-xl)" }}>{t.fehlerTitel}</h2>
              <p className="small">{t.fehlerText}</p>
              <p className="small"><span className="ph">[KONTAKT_EMAIL_REDAKTION]</span></p>
            </article>
            <article className="card card--pad">
              <h2 style={{ fontSize: "var(--text-xl)" }}>{t.koopTitel}</h2>
              <p className="small">{t.koopText}</p>
              <p className="small"><span className="ph">[KONTAKT_EMAIL_KOOPERATION]</span></p>
            </article>
          </div>
          <PlatzhalterHinweis lang={lang}>{t.platzhalter}</PlatzhalterHinweis>
          <p className="small muted">
            {t.datenschutzVor}
            <Link href={pfad(lang, "/datenschutz")}>{t.datenschutzLink}</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
