import type { Landingpage } from "./index";
import { FF as F } from "./typen";

/** Questions fréquentes de la page d'accueil (version française de `startseitenFaq`). */
export function startseitenFaqFr(): { frage: string; antwort: string }[] {
  return [
    { frage: "Est-ce un site de l'État ?", antwort: "Non. Nous sommes un site privé et pas une administration. Ce que nous disons sur la loi, nous le prouvons avec des sources officielles. Tu les trouves sous [Sources et méthodes](/quellen-methodik)." },
    { frage: "Est-ce que cela coûte quelque chose ?", antwort: "Non. Le simulateur et tous les textes sont gratuits." },
    { frage: "Dois-je donner mon nom ou mon e-mail ?", antwort: "Non. Le simulateur fonctionne uniquement sur ton appareil. Nous ne recevons pas tes réponses. Tu n'as besoin de coordonnées que si tu veux nous envoyer toi-même une question." },
    { frage: "Les nouvelles règles s'appliquent-elles déjà ?", antwort: `Pas encore. La loi est adoptée. Les nouvelles règles s'appliquent à partir du 1er janvier ${F.ab}. En savoir plus sous [Nouveau en ${F.ab}](/reform-2027).` },
    { frage: "Puis-je commencer avant 18 ans ?", antwort: "Oui, si tu y as droit. La loi ne fixe pas d'âge minimum. Ce qui compte, c'est si tu cotises à l'assurance retraite – par exemple en tant qu'apprenti. Tes parents doivent donner leur accord pour le contrat. Les élèves sans emploi n'y ont en général pas droit." },
    { frage: "Le résultat du simulateur est-il sûr ?", antwort: "En partie. Ce que tu verses et ce que l'État ajoute selon la loi est fixé. De combien l'argent grandit, personne ne le sait. C'est pourquoi le simulateur ne montre ici que des exemples. L'argent placé peut aussi baisser." },
    { frage: "Est-ce que je reçois ici un conseil personnel ?", antwort: "Non. Nous expliquons de façon générale. Si tu veux un conseil personnel, tu peux envoyer une question. Avant l'envoi, tu vois qui la reçoit." },
    { frage: "Qui reçoit mes données ?", antwort: "Seulement le destinataire que tu choisis toi-même dans le formulaire. Pour l'instant, il n'y a pas encore de partenaires. Tout reste donc chez nous. En savoir plus sous [Partenaires](/partner)." },
  ];
}

/** Pages thématiques pour les campagnes (version française de `landingpages`). */
export function landingpagesFr(): Landingpage[] {
  return [
    {
      slug: "was-aendert-sich-2027",
      frage: "Qu'est-ce qui change en 2027 pour l'épargne retraite ?",
      kurz: `De nouvelles règles s'appliquent à partir de ${F.ab}. L'essentiel en deux minutes.`,
      antwort: [
        `À partir du 1er janvier ${F.ab}, il existe une nouvelle façon d'épargner pour la retraite avec l'aide de l'État. Ton argent peut être placé dans de nombreuses entreprises à la fois. Une garantie n'est plus obligatoire.`,
        `L'État ajoute de l'argent : 50 centimes pour chaque euro jusqu'à ${F.stufe1Bis} par an, puis 25 centimes par euro jusqu'à ${F.stufe2Bis}.`,
      ],
      punkte: [`Jusqu'à ${F.maxGrund} de complément par an`, `Jusqu'à ${F.kindMax} en plus par enfant`, `Compte-titres standard : ${F.kostenMax} de frais au maximum`, "Les anciens contrats Riester continuent"],
      einstieg: "wissen",
      artikel: ["reform-private-altersvorsorge-2027", "bestehende-riester-vertraege", "haeufige-fragen-zur-reform"],
    },
    {
      slug: "wie-entwickelt-sich-mein-vorsorgekapital",
      frage: "Comment mon épargne pourrait-elle grandir ?",
      kurz: "Essaie ce que changent l'épargne, le temps et les frais.",
      antwort: [
        "Ce que devient un montant mensuel dépend de trois choses : pendant combien de temps tu épargnes, combien tu épargnes et de combien l'argent grandit.",
        "Notre simulateur te le montre tout de suite – gratuitement et sans coordonnées.",
      ],
      punkte: ["Résultat immédiat, sans inscription", "Trois exemples à comparer", "Le complément de l'État est compris", "Un exemple, pas une prévision"],
      einstieg: "rechner",
      artikel: ["so-funktioniert-der-rechner", "annahmen-hinter-den-berechnungen", "inflation-und-kaufkraft"],
    },
    {
      slug: "foerderung-fuer-familien",
      frage: "Quel argent en plus pour les familles ?",
      kurz: `À partir de ${F.ab}, il y a jusqu'à ${F.kindMax} en plus par enfant – même pour de petits montants.`,
      antwort: [
        `Pour chaque enfant pour lequel tu reçois les allocations familiales, l'État ajoute un euro pour chaque euro épargné – jusqu'à ${F.kindMax} par enfant et par an. Tu obtiens le montant complet dès que tu épargnes ${F.kindMaxMonat} par mois – et cela pour chaque enfant.`,
        `Le complément normal s'y ajoute. Tu dois épargner au moins ${F.mindest} par an et y avoir droit.`,
      ],
      punkte: ["Un euro en plus pour chaque euro épargné", `Au maximum ${F.kindMax} par enfant et par an`, "Seulement tant qu'il y a des allocations familiales", "Un seul parent le reçoit par enfant"],
      einstieg: "rechner",
      artikel: ["altersvorsorge-fuer-familien", "kinderzulage-voraussetzungen", "staatliche-foerderung-verstehen"],
    },
    {
      slug: "was-ist-ein-altersvorsorgedepot",
      frage: "Qu'est-ce qu'un compte-titres retraite (Altersvorsorgedepot) ?",
      kurz: `La nouvelle façon d'épargner pour la retraite à partir de ${F.ab}.`,
      antwort: [
        "C'est une sorte de compte pour ta retraite. Il ne contient pas d'argent liquide, mais des parts de nombreuses entreprises. Ainsi, l'argent peut grandir davantage – mais il peut aussi baisser.",
        `Si tu aimes la simplicité, tu prends le compte-titres standard : deux paniers tout prêts et ${F.kostenMax} de frais par an au maximum. Si tu préfères la sécurité, tu choisis une offre avec garantie.`,
      ],
      punkte: [`Début le 1er janvier ${F.ab}`, "L'État ajoute de l'argent", `Versement en général à partir de ${F.auszahlungAb} ans`, "Sans garantie, tu peux perdre de l'argent"],
      einstieg: "wissen",
      artikel: ["altersvorsorgedepot", "garantien-und-ihre-auswirkungen", "etfs-und-fonds"],
    },
    {
      slug: "sparbeitrag-und-laufzeit",
      frage: "Qu'est-ce qui rapporte le plus : épargner plus ou commencer plus tôt ?",
      kurz: "Calcule toi-même ce que changent le temps et le montant.",
      antwort: [
        "L'argent qui grandit rapporte un gain. Ce gain rapporte à son tour un gain l'année suivante. On appelle cela les intérêts composés. C'est pourquoi l'argent grandit plus vite dans les dernières années que dans les premières.",
        "Dans le simulateur, tu vois tout de suite ce qui change si tu commences plus tôt ou si tu épargnes plus.",
      ],
      punkte: ["Âge et montant au choix", "Chaque année visible sur le graphique", "Le complément de l'État est compris", "Une croissance régulière est une simplification"],
      einstieg: "rechner",
      artikel: ["so-funktioniert-der-rechner", "private-altersvorsorge-einfach-erklaert", "rentenluecke-und-vorsorgebedarf"],
    },
    {
      slug: "kosten-und-risiken",
      frage: "À quoi faire attention pour les frais et les risques ?",
      kurz: "Les frais sont certains. Les gains ne le sont pas.",
      antwort: [
        "Le prestataire prend chaque année un petit peu de ton argent pour son travail. Sur de nombreuses années, cela fait beaucoup.",
        "L'argent placé dans des entreprises monte et descend. Sans garantie, il peut y avoir à la fin moins que ce que tu as versé. Beaucoup d'entreprises différentes et beaucoup de temps réduisent le risque. Il ne disparaît pas.",
      ],
      punkte: ["Compare les frais par an", `Compte-titres standard : ${F.kostenMax} au maximum`, "Une garantie coûte de la croissance", "Tu peux perdre de l'argent"],
      einstieg: "wissen",
      artikel: ["kosten-und-gebuehren", "risiken-von-kapitalmarktanlagen", "garantien-und-ihre-auswirkungen"],
    },
  ];
}
