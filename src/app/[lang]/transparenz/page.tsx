import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/Bausteine";
import { site } from "@/config/site";
import { alternativen, istSprache, pfad, type Lang, type LangParams } from "@/i18n";

const T = {
  de: {
    metaTitel: "Wie wir Geld verdienen",
    metaText:
      "Wovon diese Seite lebt, wie Partner uns später bezahlen könnten und wie wir offen mit unserem eigenen Interesse umgehen.",
    eyebrow: "Offen gesagt",
    titel: "Wie wir Geld verdienen",
    heroText:
      "Rechner und Wissen kosten dich nichts. Hier steht, wovon diese Seite später leben soll – und was das für dich heißt.",
    krume: "Wie wir Geld verdienen",
    standTitel: "So ist es heute",
    stand: (n: string) =>
      `Es gibt noch keine Partner. ${n} bekommt im Moment kein Geld von Anbietern oder Vermittlern – gar keins.`,
    modellTitel: "So soll es später laufen",
    modell: (n: string) =>
      `${n} ist ein kommerzielles Angebot. Das heißt: Wir wollen damit Geld verdienen. Später bezahlen uns Partner, wenn du über unser Formular freiwillig eine Anfrage an einen dieser Partner schickst. Dich kostet das nichts.`,
    modelleTitel: "Drei mögliche Arten der Bezahlung",
    modelleText: "Welche Art gilt, hängt davon ab, was wir mit dem jeweiligen Partner vereinbaren:",
    spalteModell: "Art",
    spalteWann: "Wann wir Geld bekommen",
    modelle: [
      ["Geld für jede passende Anfrage", "wenn eine Anfrage festgelegte, aufgeschriebene Qualitätsregeln erfüllt und beim Partner angekommen ist"],
      ["Geld für jede gelungene Vermittlung", "wenn aus der Anfrage wirklich ein Kontakt oder ein Termin wird"],
      ["Provision bei Vertragsabschluss", "wenn du mit dem Partner einen Vertrag abschließt und der Vertrag bestätigt ist"],
    ],
    nennenVor:
      "Sobald Partner feststehen, sagen wir bei jedem Partner, welche Art gilt. Das steht dann im Transparenzhinweis – auf der ",
    nennenLink: "Partnerseite",
    nennenNach: " und im Anfrageformular.",
    inhalteTitel: "Was das für unsere Texte und den Rechner heißt",
    inhalte: [
      "Wissensartikel und Rechner entstehen ohne Einfluss von Partnern. Sie nennen keine einzelnen Produkte.",
      "Der Rechner bevorzugt kein Produkt. Er führt auch nicht von selbst zu einer Anfrage.",
      "Wir nennen keinen Anbieter „den besten“ oder „den günstigsten“, wenn es dafür keinen aktuellen Beleg gibt, den man nachprüfen kann.",
      "Wie viel ein Partner zahlt, entscheidet nicht darüber, wie oder in welcher Reihenfolge wir Partner zeigen. Falls wir einen Partner doch einmal aus Geldgründen hervorheben, kennzeichnen wir das deutlich.",
    ],
    konfliktTitel: "Unser eigenes Interesse – offen gesagt",
    konflikt:
      "Wir verdienen daran, wenn Anfragen gestellt werden. Das nennt man einen Interessenkonflikt. Darum ist uns wichtig: Du bekommst alle Infos und alle Rechenergebnisse vollständig, ohne deine Kontaktdaten anzugeben. Unabhängige und kostenlose Auskunft bekommst du außerdem bei der Deutschen Rentenversicherung. Die Verbraucherzentralen beraten unabhängig von Anbietern, das kostet aber etwas.",
    beratungTitel: "Wir beraten nicht",
    beratung: (n: string) =>
      `${n} berät nicht zu Geldanlage, Versicherungen, Steuern oder Recht. Wir vermitteln selbst auch keine Verträge. Für Beratung und Vermittlung ist der jeweilige Partner verantwortlich – im Rahmen seiner Zulassung.`,
  },
  en: {
    metaTitel: "How we earn money",
    metaText:
      "What this site lives on, how partners could pay us later and how we deal openly with our own interest.",
    eyebrow: "Being open",
    titel: "How we earn money",
    heroText:
      "The calculator and the articles cost you nothing. Here you can read what this site is meant to live on later – and what that means for you.",
    krume: "How we earn money",
    standTitel: "How things are today",
    stand: (n: string) =>
      `There are no partners yet. At the moment ${n} gets no money from providers or brokers – none at all.`,
    modellTitel: "How it is meant to work later",
    modell: (n: string) =>
      `${n} is a commercial service. That means: we want to earn money with it. Later, partners will pay us when you choose to send a request to one of them through our form. It costs you nothing.`,
    modelleTitel: "Three possible ways of being paid",
    modelleText: "Which one applies depends on what we agree with each partner:",
    spalteModell: "Type",
    spalteWann: "When we get paid",
    modelle: [
      ["Payment for each suitable request", "when a request meets fixed, written-down quality rules and has reached the partner"],
      ["Payment for each successful introduction", "when the request really leads to a contact or an appointment"],
      ["Commission when a contract is signed", "when you sign a contract with the partner and the contract is confirmed"],
    ],
    nennenVor:
      "As soon as partners are fixed, we will say for each partner which type applies. You will find it in the transparency note – on the ",
    nennenLink: "partner page",
    nennenNach: " and in the request form.",
    inhalteTitel: "What this means for our articles and the calculator",
    inhalte: [
      "Articles and the calculator are made without any influence from partners. They do not name individual products.",
      "The calculator does not favour any product. It also does not lead to a request by itself.",
      "We do not call any provider “the best” or “the cheapest” unless there is current proof that can be checked.",
      "How much a partner pays does not decide how or in which order we show partners. If we ever do highlight a partner for money reasons, we will mark that clearly.",
    ],
    konfliktTitel: "Our own interest – said openly",
    konflikt:
      "We earn money when requests are sent. This is called a conflict of interest. That is why this matters to us: you get all the information and all calculator results in full, without giving your contact details. You can also get independent and free information from the German pension insurance (Deutsche Rentenversicherung). The consumer advice centres (Verbraucherzentralen) give advice that is independent of providers, but they charge a fee.",
    beratungTitel: "We do not give advice",
    beratung: (n: string) =>
      `${n} does not give advice on investments, insurance, tax or law. We also do not arrange contracts ourselves. The partner in question is responsible for advice and for arranging contracts – within the limits of its licence.`,
  },
  fr: {
    metaTitel: "Comment nous gagnons de l'argent",
    metaText:
      "De quoi vit ce site, comment des partenaires pourraient nous payer plus tard et comment nous parlons ouvertement de notre propre intérêt.",
    eyebrow: "En toute franchise",
    titel: "Comment nous gagnons de l'argent",
    heroText:
      "Le simulateur et les articles ne te coûtent rien. Ici, tu lis de quoi ce site doit vivre plus tard – et ce que cela veut dire pour toi.",
    krume: "Comment nous gagnons de l'argent",
    standTitel: "La situation aujourd'hui",
    stand: (n: string) =>
      `Il n'y a pas encore de partenaires. Pour l'instant, ${n} ne reçoit pas d'argent de prestataires ou d'intermédiaires – rien du tout.`,
    modellTitel: "Comment cela doit fonctionner plus tard",
    modell: (n: string) =>
      `${n} est une offre commerciale. Cela veut dire : nous voulons gagner de l'argent avec. Plus tard, des partenaires nous paieront quand tu enverras de ton plein gré, par notre formulaire, une demande à l'un d'eux. Cela ne te coûte rien.`,
    modelleTitel: "Trois façons possibles d'être payés",
    modelleText: "La façon qui s'applique dépend de ce que nous convenons avec chaque partenaire :",
    spalteModell: "Type",
    spalteWann: "Quand nous recevons de l'argent",
    modelle: [
      ["Paiement pour chaque demande adaptée", "quand une demande respecte des règles de qualité fixées et écrites, et qu'elle est arrivée chez le partenaire"],
      ["Paiement pour chaque mise en relation réussie", "quand la demande aboutit vraiment à un contact ou à un rendez-vous"],
      ["Commission à la signature d'un contrat", "quand tu signes un contrat avec le partenaire et que le contrat est confirmé"],
    ],
    nennenVor:
      "Dès que des partenaires seront fixés, nous dirons pour chacun quel type s'applique. Ce sera écrit dans la note de transparence – sur la ",
    nennenLink: "page des partenaires",
    nennenNach: " et dans le formulaire de demande.",
    inhalteTitel: "Ce que cela veut dire pour nos textes et le simulateur",
    inhalte: [
      "Les articles et le simulateur sont réalisés sans influence des partenaires. Ils ne citent aucun produit précis.",
      "Le simulateur ne favorise aucun produit. Il ne mène pas non plus de lui-même à une demande.",
      "Nous n'appelons aucun prestataire « le meilleur » ou « le moins cher » s'il n'existe pas de preuve actuelle et vérifiable.",
      "Ce que paie un partenaire ne décide pas de la façon ni de l'ordre dans lesquels nous montrons les partenaires. Si nous mettons quand même un jour un partenaire en avant pour des raisons d'argent, nous l'indiquerons clairement.",
    ],
    konfliktTitel: "Notre propre intérêt – en toute franchise",
    konflikt:
      "Nous gagnons de l'argent quand des demandes sont envoyées. On appelle cela un conflit d'intérêts. C'est pourquoi ceci est important pour nous : tu reçois toutes les informations et tous les résultats de calcul en entier, sans donner tes coordonnées. Tu peux aussi obtenir des renseignements indépendants et gratuits auprès de l'assurance retraite allemande (Deutsche Rentenversicherung). Les centres de défense des consommateurs (Verbraucherzentralen) conseillent indépendamment des prestataires, mais c'est payant.",
    beratungTitel: "Nous ne donnons pas de conseil",
    beratung: (n: string) =>
      `${n} ne donne pas de conseil sur les placements, les assurances, les impôts ou le droit. Nous ne vendons pas non plus de contrats nous-mêmes. Le partenaire concerné est responsable du conseil et de la vente – dans le cadre de son agrément.`,
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

          <h2>{t.modelleTitel}</h2>
          <p>{t.modelleText}</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">{t.spalteModell}</th><th scope="col">{t.spalteWann}</th></tr></thead>
              <tbody>
                {t.modelle.map(([modell, wann]) => (
                  <tr key={modell}><th scope="row">{modell}</th><td>{wann}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {t.nennenVor}
            <Link href={pfad(lang, "/partner")}>{t.nennenLink}</Link>
            {t.nennenNach}
          </p>

          <h2>{t.inhalteTitel}</h2>
          <ul>
            {t.inhalte.map((punkt) => <li key={punkt}>{punkt}</li>)}
          </ul>

          <h2>{t.konfliktTitel}</h2>
          <p>{t.konflikt}</p>

          <h2>{t.beratungTitel}</h2>
          <p>{t.beratung(site.name)}</p>
        </div>
      </section>
    </>
  );
}
