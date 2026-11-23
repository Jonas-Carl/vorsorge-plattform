import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import carlBild from "../../../../public/team/carl.jpg";
import jonasBild from "../../../../public/team/jonas.jpg";
import { notFound } from "next/navigation";
import { CtaRechner, PageHero } from "@/components/Bausteine";
import { site } from "@/config/site";
import { alternativen, istSprache, pfad, type Lang, type LangParams } from "@/i18n";

const T = {
  de: {
    metaTitel: "Über uns",
    metaText: (n: string) =>
      `Wofür ${n} steht: Sparen fürs Alter einfach erklärt, mit offenen Quellen.`,
    eyebrow: "Über uns",
    titel: "Sparen fürs Alter muss nicht kompliziert klingen",
    heroText: (n: string) =>
      `${n} erklärt private Altersvorsorge so, dass du sie ohne Vorwissen verstehst. Und wir zeigen offen, wie gerechnet wird.`,
    krume: "Über uns",
    sindTitel: "Was wir sind",
    sind:
      "Eine Informationsplattform zur privaten Altersvorsorge in Deutschland. Wir erklären die Regeln verständlich, rechnen transparente Beispiele und melden uns auf Wunsch persönlich bei dir. Wer wir sind und wie wir uns finanzieren, steht offen unter",
    sindLink:
      "So arbeiten wir",
    nichtTitel: "Was wir nicht sind",
    nicht:
      "Wir sind kein Amt. Wir sind kein Träger der gesetzlichen Rentenversicherung. Und wir sind kein offizielles Vergleichsportal. Über diese Seite verkaufen wir keine Verträge.",
    messenTitel: "Daran kannst du uns messen",
    verstaendlich: ["Verständlich:", "kurze Sätze, erklärte Fachwörter, Beispiele zum Anfassen."],
    belegt: ["Belegt:", "Was wir über Gesetze sagen, hat eine amtliche Quelle und ein Datum – siehe "],
    belegtLink: "Quellen und Rechenwege",
    ehrlich: ["Ehrlich, wenn etwas unsicher ist:", "Eine Annahme nennen wir Annahme. Was noch offen ist, kennzeichnen wir als offen."],
    daten: ["Sparsam mit Daten:", "kein Tracking ohne deine Einwilligung. Für Rechenergebnisse brauchst du keine Kontaktdaten."],
    werTitel: "Wer dahintersteht",
    wer: (n: string) =>
      `${n} ist ein Angebot der RenteKannMehr GbR aus Osnabrück. Gegründet und betrieben wird die Seite von Carl Buermeyer und Jonas Scheinert. Wir arbeiten selbst bei tecis.`,
    rolle: "Gründer",
  },
  en: {
    metaTitel: "About us",
    metaText: (n: string) =>
      `What ${n} stands for: saving for old age explained simply, with open sources.`,
    eyebrow: "About us",
    titel: "Saving for old age does not have to sound complicated",
    heroText: (n: string) =>
      `${n} explains private pension saving so that you understand it without knowing anything beforehand. And we show openly how the numbers are worked out.`,
    krume: "About us",
    sindTitel: "What we are",
    sind:
      "An information platform on private pension saving in Germany. We explain the rules clearly, work through transparent examples and, if you wish, put you in touch with selected partners. How we are funded is set out openly under",
    sindLink:
      "How we work",
    nichtTitel: "What we are not",
    nicht:
      "We are not a public authority. We are not a provider of the statutory pension insurance. And we are not an official comparison portal. We do not give you personal advice. We also do not arrange contracts ourselves.",
    messenTitel: "What you can hold us to",
    verstaendlich: ["Easy to understand:", "short sentences, technical words explained, hands-on examples."],
    belegt: ["Backed up:", "What we say about the law has an official source and a date – see "],
    belegtLink: "Sources and methods",
    ehrlich: ["Honest when something is uncertain:", "We call an assumption an assumption. What is still open is marked as open."],
    daten: ["Careful with data:", "no tracking without your consent. You do not need to give contact details to see calculator results."],
    werTitel: "Who is behind it",
    wer: (n: string) =>
      `${n} is a service of RenteKannMehr GbR from Osnabrück. The site was founded and is run by Carl Buermeyer and Jonas Scheinert. We work at tecis ourselves.`,
    rolle: "Founder",
  },
  fr: {
    metaTitel: "À propos",
    metaText: (n: string) =>
      `Ce que défend ${n} : l'épargne retraite expliquée simplement, avec des sources ouvertes.`,
    eyebrow: "À propos",
    titel: "L'épargne retraite n'a pas besoin de sembler compliquée",
    heroText: (n: string) =>
      `${n} explique l'épargne retraite privée pour que tu la comprennes sans rien savoir avant. Et nous montrons ouvertement comment nous calculons.`,
    krume: "À propos",
    sindTitel: "Ce que nous sommes",
    sind:
      "Une plateforme d'information sur l'épargne retraite privée en Allemagne. Nous expliquons les règles clairement, calculons des exemples transparents et, si tu le souhaites, te mettons en contact avec des partenaires sélectionnés. Notre financement est présenté ouvertement sous",
    sindLink: "Indépendance & partenaires",
    nichtTitel: "Ce que nous ne sommes pas",
    nicht:
      "Nous ne sommes pas une administration. Nous ne sommes pas un organisme de l'assurance retraite légale. Et nous ne sommes pas un comparateur officiel. Nous ne te donnons pas de conseil personnel. Nous ne vendons pas non plus de contrats nous-mêmes.",
    messenTitel: "Ce sur quoi tu peux nous juger",
    verstaendlich: ["Compréhensible :", "des phrases courtes, des mots techniques expliqués, des exemples concrets."],
    belegt: ["Prouvé :", "ce que nous disons sur les lois a une source officielle et une date – voir "],
    belegtLink: "Sources et méthodes",
    ehrlich: ["Honnête quand quelque chose est incertain :", "une hypothèse, nous l'appelons hypothèse. Ce qui est encore ouvert, nous l'indiquons comme ouvert."],
    daten: ["Économe en données :", "pas de suivi sans ton accord. Tu n'as pas besoin de donner de coordonnées pour voir les résultats du simulateur."],
    werTitel: "Qui est derrière",
    wer: (n: string) =>
      `${n} est une offre de la RenteKannMehr GbR, basée à Osnabrück (Allemagne). Le site a été créé et est géré par Carl Buermeyer et Jonas Scheinert.`,
    rolle: "Fondateur",
  },
} satisfies Record<Lang, unknown>;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  return {
    title: T[lang].metaTitel,
    description: T[lang].metaText(site.name),
    alternates: alternativen(lang, "/ueber-uns"),
  };
}

export default async function UeberUnsSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = T[lang];

  return (
    <>
      <PageHero
        lang={lang}
        eyebrow={t.eyebrow}
        titel={t.titel}
        text={t.heroText(site.name)}
        krumen={[{ label: t.krume }]}
      />
      <section className="section">
        <div className="wrap grid grid--2" style={{ gap: "clamp(2rem, 5vw, 5rem)" }}>
          <div className="stack">
            <h2>{t.sindTitel}</h2>
            <p>{t.sind} <Link href={pfad(lang, "/transparenz")}>{t.sindLink}</Link>.</p>
            <h2>{t.nichtTitel}</h2>
            <p>{t.nicht}</p>
          </div>
          <div className="stack">
            <h2>{t.messenTitel}</h2>
            <ul style={{ paddingLeft: "1.2rem", display: "grid", gap: "0.6rem" }}>
              <li><strong>{t.verstaendlich[0]}</strong> {t.verstaendlich[1]}</li>
              <li>
                <strong>{t.belegt[0]}</strong> {t.belegt[1]}
                <Link href={pfad(lang, "/quellen-methodik")}>{t.belegtLink}</Link>.
              </li>
              <li><strong>{t.ehrlich[0]}</strong> {t.ehrlich[1]}</li>
              <li><strong>{t.daten[0]}</strong> {t.daten[1]}</li>
            </ul>
          </div>
        </div>
        <div className="wrap stack" style={{ marginTop: "var(--s-7)", maxWidth: "48rem" }}>
          <h2>{t.werTitel}</h2>
          <p>{t.wer(site.name)}</p>
          <ul className="team">
            {[
              { name: "Carl Buermeyer", bild: carlBild },
              { name: "Jonas Scheinert", bild: jonasBild },
            ].map((p) => (
              <li key={p.name} className="team__person">
                <Image src={p.bild} alt={p.name} className="team__bild" sizes="(max-width: 640px) 90vw, 22rem" placeholder="blur" />
                <p className="team__name">{p.name}</p>
                <p className="team__rolle">{t.rolle}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CtaRechner lang={lang} />
    </>
  );
}
