import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero, PlatzhalterHinweis } from "@/components/Bausteine";
import { alternativen, istSprache, type Lang, type LangParams } from "@/i18n";

const T = {
  de: {
    metaTitel: "Impressum",
    eyebrow: "Rechtliches",
    titel: "Impressum",
    krume: "Impressum",
    platzhalter:
      "Dieses Impressum ist noch nicht vollständig. Das Gesetz schreibt bestimmte Angaben vor (§ 5 DDG und § 18 MStV – das sind die Regeln dazu, wer hinter einer Website steht). Diese Pflichtangaben müssen vor dem Livegang mit den echten Daten des Unternehmens eingetragen und rechtlich geprüft werden. Bis dahin darf die Website nicht öffentlich betrieben werden.",
    angaben: [
      ["Anbieter (Name / Firma, Rechtsform)", "[BETREIBER_NAME_UND_RECHTSFORM]"],
      ["Anschrift", "[BETREIBER_ANSCHRIFT]"],
      ["Wer das Unternehmen vertreten darf (vertretungsberechtigte Personen)", "[VERTRETUNGSBERECHTIGTE]"],
      ["E-Mail", "[KONTAKT_EMAIL]"],
      ["Telefon oder ein anderer schneller Kontaktweg", "[KONTAKT_TELEFON]"],
      ["Registergericht und Registernummer", "[HANDELSREGISTER]"],
      ["Umsatzsteuer-Identifikationsnummer", "[UST_ID]"],
      ["Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)", "[VERANTWORTLICHE_PERSON_MIT_ANSCHRIFT]"],
      ["Zuständige Aufsichtsbehörde / Erlaubnisse (falls nötig)", "[AUFSICHT_UND_ERLAUBNISSE]"],
    ],
    offen:
      "Noch offen ist: Brauchen wir für das Vermitteln von Kontakten eine Erlaubnis oder Registrierung nach dem Gewerberecht? Und müsste sie hier stehen? Das gehört zur rechtlichen Prüfung, die noch läuft.",
  },
  en: {
    metaTitel: "Legal notice",
    eyebrow: "Legal",
    titel: "Legal notice (Impressum)",
    krume: "Legal notice",
    platzhalter:
      "This legal notice is not complete yet. German law requires certain details (§ 5 DDG and § 18 MStV – the rules on who is behind a website). These required details must be filled in with the company's real data and legally checked before the site goes live. Until then, the website must not be run publicly.",
    angaben: [
      ["Provider (name / company, legal form)", "[BETREIBER_NAME_UND_RECHTSFORM]"],
      ["Address", "[BETREIBER_ANSCHRIFT]"],
      ["Who may represent the company (authorised representatives)", "[VERTRETUNGSBERECHTIGTE]"],
      ["Email", "[KONTAKT_EMAIL]"],
      ["Phone or another quick way to get in touch", "[KONTAKT_TELEFON]"],
      ["Register court and register number", "[HANDELSREGISTER]"],
      ["VAT identification number", "[UST_ID]"],
      ["Responsible for the content (§ 18 Abs. 2 MStV)", "[VERANTWORTLICHE_PERSON_MIT_ANSCHRIFT]"],
      ["Responsible supervisory authority / licences (if needed)", "[AUFSICHT_UND_ERLAUBNISSE]"],
    ],
    offen:
      "Still open: do we need a licence or registration under German trade law for putting people in touch with partners? And would it have to be listed here? That is part of the legal review, which is still under way.",
  },
  fr: {
    metaTitel: "Mentions légales",
    eyebrow: "Mentions",
    titel: "Mentions légales (Impressum)",
    krume: "Mentions légales",
    platzhalter:
      "Ces mentions légales ne sont pas encore complètes. La loi allemande impose certaines informations (§ 5 DDG et § 18 MStV – ce sont les règles sur qui se trouve derrière un site web). Ces informations obligatoires doivent être remplies avec les vraies données de l'entreprise et vérifiées juridiquement avant la mise en ligne. D'ici là, le site ne doit pas être exploité publiquement.",
    angaben: [
      ["Éditeur (nom / société, forme juridique)", "[BETREIBER_NAME_UND_RECHTSFORM]"],
      ["Adresse", "[BETREIBER_ANSCHRIFT]"],
      ["Qui peut représenter l'entreprise (représentants légaux)", "[VERTRETUNGSBERECHTIGTE]"],
      ["E-mail", "[KONTAKT_EMAIL]"],
      ["Téléphone ou autre moyen de contact rapide", "[KONTAKT_TELEFON]"],
      ["Tribunal d'enregistrement et numéro de registre", "[HANDELSREGISTER]"],
      ["Numéro d'identification TVA", "[UST_ID]"],
      ["Responsable du contenu (§ 18 Abs. 2 MStV)", "[VERANTWORTLICHE_PERSON_MIT_ANSCHRIFT]"],
      ["Autorité de contrôle compétente / autorisations (si nécessaire)", "[AUFSICHT_UND_ERLAUBNISSE]"],
    ],
    offen:
      "Encore ouvert : avons-nous besoin d'une autorisation ou d'un enregistrement selon le droit allemand des métiers pour mettre des personnes en contact ? Et devrait-il figurer ici ? Cela fait partie de l'examen juridique, qui est encore en cours.",
  },
} satisfies Record<Lang, unknown>;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  return {
    title: T[lang].metaTitel,
    alternates: alternativen(lang, "/impressum"),
    // Solange die Pflichtangaben fehlen, soll die Seite nicht indexiert werden.
    robots: { index: false, follow: true },
  };
}

export default async function ImpressumSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = T[lang];

  return (
    <>
      <PageHero lang={lang} eyebrow={t.eyebrow} titel={t.titel} krumen={[{ label: t.krume }]} />
      <section className="section">
        <div className="wrap prose">
          <PlatzhalterHinweis lang={lang}>{t.platzhalter}</PlatzhalterHinweis>
          <div className="table-wrap">
            <table>
              <tbody>
                {t.angaben.map(([label, wert]) => (
                  <tr key={wert}><th scope="row">{label}</th><td><span className="ph">{wert}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">{t.offen}</p>
        </div>
      </section>
    </>
  );
}
