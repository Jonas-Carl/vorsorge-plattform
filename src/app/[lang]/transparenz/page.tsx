import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/Bausteine";
import { site } from "@/config/site";
import { alternativen, istSprache, pfad, type Lang, type LangParams } from "@/i18n";

const T = {
  de: {
    metaTitel: "Unabhängigkeit & Partner",
    metaText: "Wie die Zusammenarbeit mit Partnern funktioniert und warum Rechner und Texte davon unabhängig sind.",
    eyebrow: "Unabhängigkeit",
    titel: "Unabhängigkeit & Partner",
    heroText: "Rechner und Wissen sind kostenlos und unabhängig. Hier steht kurz, wie die Zusammenarbeit mit Partnern funktioniert.",
    krume: "Unabhängigkeit & Partner",
    standTitel: "So ist es heute",
    stand: (n: string) => `Es gibt noch keine Partner. ${n} bekommt im Moment kein Geld von Anbietern oder Vermittlern.`,
    modellTitel: "Wie die Zusammenarbeit funktioniert",
    modell: (n: string) =>
      `${n} ist ein kommerzielles Angebot. Wenn du über unser Formular freiwillig eine Anfrage an einen Partner schickst, kann dieser Partner uns dafür bezahlen – zum Beispiel für die Anfrage, für einen vereinbarten Termin oder als Provision bei einem Vertrag. Für dich ist das kostenlos.`,
    nennenVor: "Welche Art gilt, steht bei jedem Partner auf der ",
    nennenLink: "Partnerseite",
    nennenNach: " und im Anfrageformular.",
    inhalteTitel: "Was davon unabhängig bleibt",
    inhalte: [
      "Rechner und Texte entstehen ohne Einfluss von Partnern und nennen keine einzelnen Produkte.",
      "Alle Ergebnisse siehst du vollständig, ohne Kontaktdaten anzugeben.",
      "Wie viel ein Partner zahlt, entscheidet nicht über Reihenfolge oder Darstellung.",
    ],
    beratungTitel: "Beratung",
    beratung: (n: string) =>
      `${n} berät nicht zu Geldanlage, Versicherungen, Steuern oder Recht und vermittelt selbst keine Verträge. Dafür ist der jeweilige Partner im Rahmen seiner Zulassung verantwortlich. Unabhängige, kostenlose Auskunft gibt es auch bei der Deutschen Rentenversicherung.`,
  },
  en: {
    metaTitel: "Independence & partners",
    metaText: "How working with partners works and why the calculator and articles are independent of it.",
    eyebrow: "Independence",
    titel: "Independence & partners",
    heroText: "The calculator and the articles are free and independent. Here is a short explanation of how working with partners works.",
    krume: "Independence & partners",
    standTitel: "How things are today",
    stand: (n: string) => `There are no partners yet. At the moment ${n} gets no money from providers or brokers.`,
    modellTitel: "How working with partners works",
    modell: (n: string) =>
      `${n} is a commercial service. If you choose to send a request to a partner through our form, that partner may pay us for it – for example for the request, for an agreed appointment or as a commission on a contract. It costs you nothing.`,
    nennenVor: "Which type applies is shown for each partner on the ",
    nennenLink: "partner page",
    nennenNach: " and in the request form.",
    inhalteTitel: "What stays independent",
    inhalte: [
      "The calculator and the articles are made without any influence from partners and do not name individual products.",
      "You see all results in full, without giving your contact details.",
      "How much a partner pays does not decide the order or how partners are shown.",
    ],
    beratungTitel: "Advice",
    beratung: (n: string) =>
      `${n} does not give advice on investments, insurance, tax or law and does not arrange contracts itself. The partner in question is responsible for that, within the limits of its licence. Independent, free information is also available from the German pension insurance (Deutsche Rentenversicherung).`,
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
      `${n} est une offre commerciale. Si tu envoies de ton plein gré une demande à un partenaire par notre formulaire, ce partenaire peut nous payer pour cela – par exemple pour la demande, pour un rendez-vous convenu ou sous forme de commission sur un contrat. Pour toi, c'est gratuit.`,
    nennenVor: "Le type qui s'applique est indiqué pour chaque partenaire sur la ",
    nennenLink: "page des partenaires",
    nennenNach: " et dans le formulaire de demande.",
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
