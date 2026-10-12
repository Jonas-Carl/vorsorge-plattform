import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaRechner, PageHero, PlatzhalterHinweis } from "@/components/Bausteine";
import { site } from "@/config/site";
import { alternativen, istSprache, pfad, type Lang, type LangParams } from "@/i18n";

const T = {
  de: {
    metaTitel: "Über uns",
    metaText: (n: string) =>
      `Wofür ${n} steht: Sparen fürs Alter einfach erklärt, mit offenen Quellen. Und wir sagen offen, wie wir Geld verdienen.`,
    eyebrow: "Über uns",
    titel: "Sparen fürs Alter muss nicht kompliziert klingen",
    heroText: (n: string) =>
      `${n} erklärt private Altersvorsorge so, dass du sie ohne Vorwissen verstehst. Und wir zeigen offen, wie gerechnet wird.`,
    krume: "Über uns",
    sindTitel: "Was wir sind",
    sind:
      "Eine private Info-Seite zum Sparen fürs Alter in Deutschland. Wir wollen damit Geld verdienen (kommerzielles Angebot). Wir erklären. Wir rechnen Beispiele. Und wenn du es möchtest, stellen wir einen Kontakt zu Partnern her.",
    nichtTitel: "Was wir nicht sind",
    nicht:
      "Wir sind kein Amt. Wir sind kein Träger der gesetzlichen Rentenversicherung. Und wir sind kein offizielles Vergleichsportal. Wir beraten dich nicht persönlich. Wir vermitteln selbst auch keine Verträge.",
    messenTitel: "Daran kannst du uns messen",
    verstaendlich: ["Verständlich:", "kurze Sätze, erklärte Fachwörter, Beispiele zum Anfassen."],
    belegt: ["Belegt:", "Was wir über Gesetze sagen, hat eine amtliche Quelle und ein Datum – siehe "],
    belegtLink: "Quellen und Rechenwege",
    ehrlich: ["Ehrlich, wenn etwas unsicher ist:", "Eine Annahme nennen wir Annahme. Was noch offen ist, kennzeichnen wir als offen."],
    geld: ["Offen beim Geld:", "Wovon wir leben, steht unter "],
    geldLink: "Wie wir Geld verdienen",
    daten: ["Sparsam mit Daten:", "kein Tracking ohne deine Einwilligung. Für Rechenergebnisse brauchst du keine Kontaktdaten."],
    platzhalter: (n: string) =>
      `Angaben zum Betreiber, zum Team und dazu, wer für die Texte verantwortlich ist (Namen, Qualifikationen), fehlen noch. Wir erfinden sie nicht. Sie werden vor dem Livegang ergänzt – so, wie das Unternehmen wirklich aufgebaut ist. „${n}“ ist ein Arbeitstitel.`,
  },
  en: {
    metaTitel: "About us",
    metaText: (n: string) =>
      `What ${n} stands for: saving for old age explained simply, with open sources. And we say openly how we earn money.`,
    eyebrow: "About us",
    titel: "Saving for old age does not have to sound complicated",
    heroText: (n: string) =>
      `${n} explains private pension saving so that you understand it without knowing anything beforehand. And we show openly how the numbers are worked out.`,
    krume: "About us",
    sindTitel: "What we are",
    sind:
      "A private information site about saving for old age in Germany. We want to earn money with it (a commercial service). We explain. We work through examples. And if you want, we put you in touch with partners.",
    nichtTitel: "What we are not",
    nicht:
      "We are not a public authority. We are not a provider of the statutory pension insurance. And we are not an official comparison portal. We do not give you personal advice. We also do not arrange contracts ourselves.",
    messenTitel: "What you can hold us to",
    verstaendlich: ["Easy to understand:", "short sentences, technical words explained, hands-on examples."],
    belegt: ["Backed up:", "What we say about the law has an official source and a date – see "],
    belegtLink: "Sources and methods",
    ehrlich: ["Honest when something is uncertain:", "We call an assumption an assumption. What is still open is marked as open."],
    geld: ["Open about money:", "What we live on is explained under "],
    geldLink: "How we earn money",
    daten: ["Careful with data:", "no tracking without your consent. You do not need to give contact details to see calculator results."],
    platzhalter: (n: string) =>
      `Details about the operator, the team and who is responsible for the content (names, qualifications) are still missing. We do not make them up. They will be added before the site goes live – based on how the company is really set up. “${n}” is a working title.`,
  },
  fr: {
    metaTitel: "À propos",
    metaText: (n: string) =>
      `Ce que défend ${n} : l'épargne retraite expliquée simplement, avec des sources ouvertes. Et nous disons ouvertement comment nous gagnons de l'argent.`,
    eyebrow: "À propos",
    titel: "L'épargne retraite n'a pas besoin de sembler compliquée",
    heroText: (n: string) =>
      `${n} explique l'épargne retraite privée pour que tu la comprennes sans rien savoir avant. Et nous montrons ouvertement comment nous calculons.`,
    krume: "À propos",
    sindTitel: "Ce que nous sommes",
    sind:
      "Un site d'information privé sur l'épargne retraite en Allemagne. Nous voulons gagner de l'argent avec (offre commerciale). Nous expliquons. Nous calculons des exemples. Et si tu le veux, nous te mettons en contact avec des partenaires.",
    nichtTitel: "Ce que nous ne sommes pas",
    nicht:
      "Nous ne sommes pas une administration. Nous ne sommes pas un organisme de l'assurance retraite légale. Et nous ne sommes pas un comparateur officiel. Nous ne te donnons pas de conseil personnel. Nous ne vendons pas non plus de contrats nous-mêmes.",
    messenTitel: "Ce sur quoi tu peux nous juger",
    verstaendlich: ["Compréhensible :", "des phrases courtes, des mots techniques expliqués, des exemples concrets."],
    belegt: ["Prouvé :", "ce que nous disons sur les lois a une source officielle et une date – voir "],
    belegtLink: "Sources et méthodes",
    ehrlich: ["Honnête quand quelque chose est incertain :", "une hypothèse, nous l'appelons hypothèse. Ce qui est encore ouvert, nous l'indiquons comme ouvert."],
    geld: ["Ouvert sur l'argent :", "ce dont nous vivons est expliqué sous "],
    geldLink: "Comment nous gagnons de l'argent",
    daten: ["Économe en données :", "pas de suivi sans ton accord. Tu n'as pas besoin de donner de coordonnées pour voir les résultats du simulateur."],
    platzhalter: (n: string) =>
      `Les informations sur l'exploitant, sur l'équipe et sur les personnes responsables des textes (noms, qualifications) manquent encore. Nous ne les inventons pas. Elles seront ajoutées avant la mise en ligne – telles que l'entreprise est réellement organisée. « ${n} » est un nom de travail.`,
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
            <p>{t.sind}</p>
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
              <li>
                <strong>{t.geld[0]}</strong> {t.geld[1]}
                <Link href={pfad(lang, "/transparenz")}>{t.geldLink}</Link>.
              </li>
              <li><strong>{t.daten[0]}</strong> {t.daten[1]}</li>
            </ul>
          </div>
        </div>
        <div className="wrap" style={{ marginTop: "var(--s-7)" }}>
          <PlatzhalterHinweis lang={lang}>{t.platzhalter(site.name)}</PlatzhalterHinweis>
        </div>
      </section>
      <CtaRechner lang={lang} />
    </>
  );
}
