import type { Lang } from "@/lib/format";
import { artikelA } from "./artikel-a";
import { artikelAEn } from "./artikel-a.en";
import { artikelB } from "./artikel-b";
import { artikelBEn } from "./artikel-b.en";
import { makeF, type Artikel, type Kategorie } from "./typen";

const artikelDe: Artikel[] = [...artikelA, ...artikelB];
const artikelEn: Artikel[] = [...artikelAEn, ...artikelBEn];

export function artikel(lang: Lang): Artikel[] {
  return lang === "en" ? artikelEn : artikelDe;
}

export function findeArtikel(slug: string, lang: Lang): Artikel | undefined {
  return artikel(lang).find((a) => a.slug === slug);
}

export const artikelSlugs: string[] = artikelDe.map((a) => a.slug);

export const kategorien: Kategorie[] = [
  "Grundlagen", "Reform 2027", "Förderung", "Geldanlage", "Lebenssituationen", "Rechner & Methodik",
];

/** Häufige Fragen der Startseite (auch als strukturierte Daten ausgegeben). */
export function startseitenFaq(lang: Lang): { frage: string; antwort: string }[] {
  const F = makeF(lang);
  if (lang === "en") {
    return [
      { frage: "Is this a website from the state?", antwort: "No. We are a private website, not a public authority. What we say about the law, we back up with official sources. You can find them under [Sources and methods](/quellen-methodik)." },
      { frage: "Does this cost anything?", antwort: "No. The calculator and all texts are free. Later we will earn money when partners pay us for questions that you send voluntarily. We explain this under [How we earn money](/transparenz)." },
      { frage: "Do I have to give my name or email?", antwort: "No. The calculator runs only on your device. We do not receive your entries. You only need contact details if you want to send us a question yourself." },
      { frage: "Do the new rules already apply?", antwort: `Not yet. The law has been passed. The new rules apply from 1 January ${F.ab}. More under [New from ${F.ab}](/reform-2027).` },
      { frage: "Is the result of the calculator certain?", antwort: "Part of it. What you pay in and what the state adds by law is fixed. How strongly the money grows is something nobody knows. That is why the calculator only shows examples. Money that is invested can also shrink." },
      { frage: "Will I get personal advice here?", antwort: "No. We explain in general. If you want personal advice, you can send a question. Before sending, you see who receives it." },
      { frage: "Who gets my data?", antwort: "Only the recipient you choose in the form yourself. Right now there are no partners. So everything stays with us. More under [Partners](/partner)." },
    ];
  }
  return [
    { frage: "Ist das eine Seite vom Staat?", antwort: "Nein. Wir sind eine private Seite und kein Amt. Was wir über das Gesetz sagen, belegen wir mit offiziellen Quellen. Du findest sie unter [Quellen und Rechenwege](/quellen-methodik)." },
    { frage: "Kostet das etwas?", antwort: "Nein. Der Rechner und alle Texte sind kostenlos. Später verdienen wir Geld, wenn Partner uns für Fragen bezahlen, die du freiwillig abschickst. Das erklären wir unter [Wie wir Geld verdienen](/transparenz)." },
    { frage: "Muss ich meinen Namen oder meine E-Mail angeben?", antwort: "Nein. Der Rechner läuft nur auf deinem Gerät. Wir bekommen deine Angaben nicht. Kontaktdaten brauchst du nur, wenn du uns selbst eine Frage schicken willst." },
    { frage: "Gelten die neuen Regeln schon?", antwort: `Noch nicht. Das Gesetz ist beschlossen. Die neuen Regeln gelten ab dem 1. Januar ${F.ab}. Mehr unter [Neu ab ${F.ab}](/reform-2027).` },
    { frage: "Ist das Ergebnis vom Rechner sicher?", antwort: "Ein Teil ja. Was du einzahlst und was der Staat laut Gesetz dazulegt, steht fest. Wie stark das Geld wächst, weiß niemand. Darum zeigt der Rechner hier nur Beispiele. Angelegtes Geld kann auch weniger werden." },
    { frage: "Bekomme ich hier eine persönliche Beratung?", antwort: "Nein. Wir erklären allgemein. Wenn du eine persönliche Beratung möchtest, kannst du eine Frage schicken. Vor dem Abschicken siehst du, wer sie bekommt." },
    { frage: "Wer bekommt meine Daten?", antwort: "Nur der Empfänger, den du im Formular selbst auswählst. Im Moment gibt es noch keine Partner. Darum bleibt alles bei uns. Mehr unter [Partner](/partner)." },
  ];
}

/** Themen-Landingpages für Kampagnen (Social Media, Suchanzeigen). */
export type Landingpage = {
  slug: string;
  frage: string;
  kurz: string;
  antwort: string[];
  punkte: string[];
  einstieg: "rechner" | "wissen";
  artikel: string[];
};

export const landingpageSlugs = [
  "was-aendert-sich-2027",
  "wie-entwickelt-sich-mein-vorsorgekapital",
  "foerderung-fuer-familien",
  "was-ist-ein-altersvorsorgedepot",
  "sparbeitrag-und-laufzeit",
  "kosten-und-risiken",
] as const;

export function landingpages(lang: Lang): Landingpage[] {
  const F = makeF(lang);
  const en = lang === "en";
  return [
    {
      slug: "was-aendert-sich-2027",
      frage: en ? "What changes about saving for old age in 2027?" : "Was ändert sich 2027 beim Sparen fürs Alter?",
      kurz: en ? `From ${F.ab} there are new rules. The most important points in two minutes.` : `Ab ${F.ab} gelten neue Regeln. Das Wichtigste in zwei Minuten.`,
      antwort: en
        ? [
            `From 1 January ${F.ab} there is a new way to save for old age with help from the state. Your money can be invested in many companies at once. A guarantee is no longer required.`,
            `The state adds money: 50 cents for every euro up to ${F.stufe1Bis} a year, then 25 cents per euro up to ${F.stufe2Bis}.`,
          ]
        : [
            `Ab dem 1. Januar ${F.ab} gibt es einen neuen Weg, mit Hilfe vom Staat fürs Alter zu sparen. Dein Geld kann in viele Firmen auf einmal angelegt werden. Eine Garantie ist nicht mehr Pflicht.`,
            `Der Staat legt Geld dazu: 50 Cent für jeden Euro bis ${F.stufe1Bis} im Jahr, danach 25 Cent pro Euro bis ${F.stufe2Bis}.`,
          ],
      punkte: en
        ? [`Up to ${F.maxGrund} top-up a year`, `Up to ${F.kindMax} extra per child`, `Standard account: at most ${F.kostenMax} costs`, "Old Riester contracts carry on"]
        : [`Bis zu ${F.maxGrund} Zuschuss im Jahr`, `Bis zu ${F.kindMax} extra pro Kind`, `Standard-Depot: höchstens ${F.kostenMax} Kosten`, "Alte Riester-Verträge laufen weiter"],
      einstieg: "wissen",
      artikel: ["reform-private-altersvorsorge-2027", "bestehende-riester-vertraege", "haeufige-fragen-zur-reform"],
    },
    {
      slug: "wie-entwickelt-sich-mein-vorsorgekapital",
      frage: en ? "How could my savings grow?" : "Wie könnte mein Erspartes wachsen?",
      kurz: en ? "Try out what saving, time and costs do." : "Probier aus, was Sparen, Zeit und Kosten ausmachen.",
      antwort: en
        ? [
            "How much a monthly amount becomes depends on three things: how long you save, how much you save and how strongly the money grows.",
            "Our calculator shows this straight away – free and without contact details.",
          ]
        : [
            "Wie viel aus einem Betrag im Monat wird, hängt von drei Dingen ab: wie lange du sparst, wie viel du sparst und wie stark das Geld wächst.",
            "Unser Rechner zeigt dir das sofort – kostenlos und ohne Kontaktdaten.",
          ],
      punkte: en
        ? ["Result at once, no sign-up", "Three examples to compare", "State top-up included", "An example, not a forecast"]
        : ["Ergebnis sofort, ohne Anmeldung", "Drei Beispiele zum Vergleichen", "Zuschuss vom Staat ist eingerechnet", "Ein Beispiel, keine Vorhersage"],
      einstieg: "rechner",
      artikel: ["so-funktioniert-der-rechner", "annahmen-hinter-den-berechnungen", "inflation-und-kaufkraft"],
    },
    {
      slug: "foerderung-fuer-familien",
      frage: en ? "What extra money is there for families?" : "Welches Extra-Geld gibt es für Familien?",
      kurz: en ? `From ${F.ab} there is up to ${F.kindMax} extra per child – even for small amounts.` : `Ab ${F.ab} gibt es bis zu ${F.kindMax} extra pro Kind – schon bei kleinen Beträgen.`,
      antwort: en
        ? [
            `For each child you receive child benefit for, the state adds one euro for every euro you save – up to ${F.kindMax} per child and year. You reach the full amount by saving ${F.kindMaxMonat} a month.`,
            `The normal top-up comes on top. You must save at least ${F.mindest} a year and be eligible.`,
          ]
        : [
            `Für jedes Kind, für das du Kindergeld bekommst, legt der Staat auf jeden gesparten Euro einen Euro dazu – bis ${F.kindMax} pro Kind und Jahr. Das volle Extra-Geld gibt es schon, wenn du ${F.kindMaxMonat} im Monat sparst.`,
            `Dazu kommt der normale Zuschuss. Du musst mindestens ${F.mindest} im Jahr sparen und berechtigt sein.`,
          ],
      punkte: en
        ? ["One euro extra for every euro saved", `At most ${F.kindMax} per child and year`, "Only while child benefit is paid", "One parent gets it per child"]
        : ["Ein Euro extra für jeden gesparten Euro", `Höchstens ${F.kindMax} pro Kind und Jahr`, "Nur solange es Kindergeld gibt", "Pro Kind bekommt es ein Elternteil"],
      einstieg: "rechner",
      artikel: ["altersvorsorge-fuer-familien", "kinderzulage-voraussetzungen", "staatliche-foerderung-verstehen"],
    },
    {
      slug: "was-ist-ein-altersvorsorgedepot",
      frage: en ? "What is an Altersvorsorgedepot?" : "Was ist ein Altersvorsorgedepot?",
      kurz: en ? `The new way to save for old age from ${F.ab}.` : `Der neue Weg, ab ${F.ab} fürs Alter zu sparen.`,
      antwort: en
        ? [
            "It is a kind of account for your old age. It holds no cash, but shares in many companies. That lets the money grow more strongly – but it can also shrink.",
            `If you want it simple, you take the standard account: two ready-made baskets and at most ${F.kostenMax} costs a year. If you want it safe, you choose an offer with a guarantee.`,
          ]
        : [
            "Das ist eine Art Konto für dein Alter. Darin liegt kein Bargeld, sondern Anteile an vielen Firmen. So kann das Geld stärker wachsen – es kann aber auch weniger werden.",
            `Wer es einfach mag, nimmt das Standard-Depot: zwei fertige Körbe und höchstens ${F.kostenMax} Kosten im Jahr. Wer es sicher mag, wählt ein Angebot mit Garantie.`,
          ],
      punkte: en
        ? [`Starts on 1 January ${F.ab}`, "The state adds money", `Payout usually from age ${F.auszahlungAb}`, "Without a guarantee you can lose money"]
        : [`Start am 1. Januar ${F.ab}`, "Der Staat legt Geld dazu", `Auszahlung meist ab ${F.auszahlungAb} Jahren`, "Ohne Garantie kannst du Geld verlieren"],
      einstieg: "wissen",
      artikel: ["altersvorsorgedepot", "garantien-und-ihre-auswirkungen", "etfs-und-fonds"],
    },
    {
      slug: "sparbeitrag-und-laufzeit",
      frage: en ? "What matters more: saving more or starting earlier?" : "Was bringt mehr: mehr sparen oder früher anfangen?",
      kurz: en ? "Work out for yourself what time and amount each do." : "Rechne selbst nach, was Zeit und Betrag jeweils bewirken.",
      antwort: en
        ? [
            "Money that grows earns something. That something earns again the next year. This is called compound interest. That is why money grows faster in later years than in early ones.",
            "In the calculator you see at once what changes when you start earlier or save more.",
          ]
        : [
            "Geld, das wächst, bringt Gewinn. Dieser Gewinn bringt im nächsten Jahr wieder Gewinn. Das nennt man Zinseszins. Darum wächst Geld in späten Jahren schneller als in frühen.",
            "Im Rechner siehst du sofort, was sich ändert, wenn du früher anfängst oder mehr sparst.",
          ],
      punkte: en
        ? ["Choose age and amount freely", "See every year in the chart", "State top-up included", "Even growth is a simplification"]
        : ["Alter und Betrag frei wählbar", "Jedes Jahr im Bild sehen", "Zuschuss vom Staat ist eingerechnet", "Gleichmäßiges Wachstum ist eine Vereinfachung"],
      einstieg: "rechner",
      artikel: ["so-funktioniert-der-rechner", "private-altersvorsorge-einfach-erklaert", "rentenluecke-und-vorsorgebedarf"],
    },
    {
      slug: "kosten-und-risiken",
      frage: en ? "What should I watch out for with costs and risks?" : "Worauf muss ich bei Kosten und Risiken achten?",
      kurz: en ? "Costs are certain. Profits are not." : "Kosten sind sicher. Gewinne nicht.",
      antwort: en
        ? [
            "The provider takes a little of your money every year for its work. Over many years that adds up to a lot.",
            "Money in companies goes up and down. Without a guarantee, there can be less at the end than you paid in. Many different companies and a lot of time lower the risk. They do not remove it.",
          ]
        : [
            "Der Anbieter nimmt jedes Jahr ein bisschen von deinem Geld für seine Arbeit. Über viele Jahre wird daraus viel.",
            "Geld in Firmen schwankt. Ohne Garantie kann am Ende weniger da sein, als du eingezahlt hast. Viele verschiedene Firmen und viel Zeit machen das Risiko kleiner. Weg ist es nicht.",
          ],
      punkte: en
        ? ["Compare the yearly costs", `Standard account: at most ${F.kostenMax}`, "A guarantee costs growth", "You can lose money"]
        : ["Vergleiche die Kosten pro Jahr", `Standard-Depot: höchstens ${F.kostenMax}`, "Eine Garantie kostet Wachstum", "Du kannst Geld verlieren"],
      einstieg: "wissen",
      artikel: ["kosten-und-gebuehren", "risiken-von-kapitalmarktanlagen", "garantien-und-ihre-auswirkungen"],
    },
  ];
}
