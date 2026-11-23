import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/Bausteine";
import { site } from "@/config/site";
import { alternativen, istSprache, pfad, type Lang, type LangParams } from "@/i18n";

const T = {
  de: {
    metaTitel: "So arbeiten wir",
    metaText: "Wer hinter RenteKannMehr steht, wie wir uns finanzieren und was mit deiner Anfrage passiert.",
    eyebrow: "Offen gesagt",
    titel: "So arbeiten wir",
    heroText: "Rechner und Wissen sind kostenlos. Hier steht offen, wer wir sind, wie wir Geld verdienen und was mit deiner Anfrage passiert.",
    krume: "So arbeiten wir",
    standTitel: "Wer wir sind",
    stand: (n: string) => `${n} wird von Carl Buermeyer und Jonas Scheinert betrieben. Wir arbeiten selbst bei tecis. Das sagen wir offen, weil es für dich wichtig sein kann.`,
    modellTitel: "Was mit deiner Anfrage passiert",
    modell: (n: string) =>
      `${n} ist ein kommerzielles Angebot. Wenn du über unser Formular eine Beratung anfragst, geht deine Anfrage zuerst nur an uns. Wir melden uns persönlich bei dir. Möchtest du eine ausführliche Beratung, schlagen wir dir einen Berater vor – das kann ein Berater von tecis sein. Weitergegeben wird nur, wenn du dem ausdrücklich zustimmst. Für eine weitergegebene Anfrage können wir eine Vergütung bekommen. Für dich ist das kostenlos.`,
    nennenVor: "Mehr zum Ablauf unter ",
    nennenLink: "Beratung",
    nennenNach: ". Die Höhe einer möglichen Vergütung ist Teil unserer Vereinbarungen und wird nicht veröffentlicht.",
    inhalteTitel: "Was neutral bleibt",
    inhalte: [
      "Rechner und Texte erklären allgemein und nennen keine einzelnen Produkte oder Anbieter.",
      "Alle Ergebnisse siehst du vollständig, ohne Kontaktdaten anzugeben.",
      "Was im Gesetz steht, belegen wir mit amtlichen Quellen.",
    ],
    beratungTitel: "Beratung",
    beratung: (n: string) =>
      `Über ${n} verkaufen wir keine Verträge und beraten nicht zu einzelnen Produkten. Die Beratung übernimmt ein zugelassener Berater, den wir dir vorher nennen. Kostenlose, unabhängige Auskunft gibt es auch bei der Deutschen Rentenversicherung.`,
  },
  en: {
    metaTitel: "How we work",
    metaText: "Who is behind RenteKannMehr, how we are funded and what happens to your request.",
    eyebrow: "In the open",
    titel: "How we work",
    heroText: "The calculator and the articles are free. Here we say openly who we are, how we earn money and what happens to your request.",
    krume: "How we work",
    standTitel: "Who we are",
    stand: (n: string) => `${n} is run by Carl Buermeyer and Jonas Scheinert. We work at tecis ourselves. We say so openly because it may matter to you.`,
    modellTitel: "What happens to your request",
    modell: (n: string) =>
      `${n} is a commercial service. If you request advice through our form, your request first goes only to us. We get in touch personally. If you want detailed advice, we suggest an adviser – this may be an adviser from tecis. We only pass you on if you expressly agree. We may receive a fee for a request passed on. It costs you nothing.`,
    nennenVor: "More about the process under ",
    nennenLink: "Advice",
    nennenNach: ". The amount of any fee is part of our agreements and is not published.",
    inhalteTitel: "What stays neutral",
    inhalte: [
      "The calculator and the articles explain in general terms and do not name individual products or providers.",
      "You see all results in full, without giving your contact details.",
      "What the law says, we back up with official sources.",
    ],
    beratungTitel: "Advice",
    beratung: (n: string) =>
      `We do not sell contracts through ${n} and do not advise on individual products. Advice is given by a licensed adviser whom we name to you beforehand. Free, independent information is also available from the German pension insurance (Deutsche Rentenversicherung).`,
  },
  fr: {
    metaTitel: "Indépendance et partenaires",
    metaText: "Comment fonctionne la collaboration avec des partenaires et pourquoi le simulateur et les textes en sont indépendants.",
    eyebrow: "Indépendance",
    titel: "Indépendance et partenaires",
    heroText: "Le simulateur et les articles sont gratuits et indépendants. Voici en bref comment fonctionne la collaboration avec des partenaires.",
    krume: "Indépendance et partenaires",
    standTitel: "La situation aujourd'hui",
    stand: (n: string) => `Il n'y a pas encore de partenaires. Pour l'instant, ${n} ne reçoit pas d'argent de prestataires ou d'intermédiaires.`,
    modellTitel: "Comment fonctionne la collaboration",
    modell: (n: string) =>
      `${n} est une offre commerciale. Si tu demandes un conseil par notre formulaire et acceptes la transmission à un conseiller, ce conseiller peut nous payer pour le contact. Nous ne vendons pas de contrats et ne recevons pas d'argent selon que tu signes un contrat ou non. Pour toi, c'est gratuit.`,
    nennenVor: "Avant de transmettre tes données à un conseiller, nous te disons de qui il s'agit – et ne les transmettons qu'avec ton accord. Plus d'infos sous ",
    nennenLink: "Conseil",
    nennenNach: ". Le montant de la rémunération fait partie de nos contrats et n'est pas publié.",
    inhalteTitel: "Ce qui reste indépendant",
    inhalte: [
      "Le simulateur et les textes sont réalisés sans influence des partenaires et ne citent aucun produit précis.",
      "Tu vois tous les résultats en entier, sans donner tes coordonnées.",
      "Ce que paie un partenaire ne décide ni de l'ordre ni de la présentation.",
    ],
    beratungTitel: "Conseil",
    beratung: (n: string) =>
      `${n} ne donne pas de conseil sur les placements, les assurances, les impôts ou le droit et ne vend pas de contrats. C'est le partenaire concerné qui en est responsable, dans le cadre de son agrément. Tu peux aussi obtenir des renseignements indépendants et gratuits auprès de l'assurance retraite allemande (Deutsche Rentenversicherung).`,
  },
} satisfies Record<Lang, unknown>;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  return {
    title: T[lang].metaTitel,
    description: T[lang].metaText,
    alternates: alternativen(lang, "/transparenz"),
  };
}

export default async function TransparenzSeite({ params }: LangParams) {
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
        stand={site.inhaltsstand}
      />
      <section className="section">
        <div className="wrap prose">
          <div className="note note--gold">
            <h4>{t.standTitel}</h4>
            <p>{t.stand(site.name)}</p>
          </div>

          <h2>{t.modellTitel}</h2>
          <p>{t.modell(site.name)}</p>

          <p>
            {t.nennenVor}
            <Link href={pfad(lang, "/partner")}>{t.nennenLink}</Link>
            {t.nennenNach}
          </p>

          <h2>{t.inhalteTitel}</h2>
          <ul>
            {t.inhalte.map((punkt) => <li key={punkt}>{punkt}</li>)}
          </ul>

          <h2>{t.beratungTitel}</h2>
          <p>{t.beratung(site.name)}</p>
        </div>
      </section>
    </>
  );
}
