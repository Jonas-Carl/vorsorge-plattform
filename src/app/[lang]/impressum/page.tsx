import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/Bausteine";
import { alternativen, istSprache, type Lang, type LangParams } from "@/i18n";

/*
 * Registergericht/Registernummer und Umsatzsteuer-ID fehlen bewusst: Sie werden erst eingetragen,
 * wenn die GbR im Gesellschaftsregister steht bzw. das Finanzamt eine USt-IdNr. erteilt hat.
 * Dann je Sprache eine Zeile ergänzen, z. B. ["Registergericht und Registernummer", "Amtsgericht …, GsR …"].
 */
const T = {
  de: {
    metaTitel: "Impressum",
    eyebrow: "Rechtliches",
    titel: "Impressum",
    krume: "Impressum",
    angaben: [
      ["Anbieter (Name / Firma, Rechtsform)", "RenteKannMehr GbR"],
      ["Anschrift", "Rheinold-Tiling-Weg 49, 49088 Osnabrück"],
      ["Wer das Unternehmen vertreten darf (vertretungsberechtigte Personen)", "Carl Buermeyer und Jonas Scheinert (Gesellschafter)"],
      ["E-Mail", "info@rentekannmehr.de"],
      ["Telefon oder ein anderer schneller Kontaktweg", "+49 178 2971395"],
      ["Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)", "Carl Buermeyer, Rheinold-Tiling-Weg 49, 49088 Osnabrück"],
    ],
  },
  en: {
    metaTitel: "Legal notice",
    eyebrow: "Legal",
    titel: "Legal notice (Impressum)",
    krume: "Legal notice",
    angaben: [
      ["Provider (name / company, legal form)", "RenteKannMehr GbR"],
      ["Address", "Rheinold-Tiling-Weg 49, 49088 Osnabrück"],
      ["Who may represent the company (authorised representatives)", "Carl Buermeyer and Jonas Scheinert (partners)"],
      ["Email", "info@rentekannmehr.de"],
      ["Phone or another quick way to get in touch", "+49 178 2971395"],
      ["Responsible for the content (§ 18 Abs. 2 MStV)", "Carl Buermeyer, Rheinold-Tiling-Weg 49, 49088 Osnabrück"],
    ],
  },
  fr: {
    metaTitel: "Mentions légales",
    eyebrow: "Mentions",
    titel: "Mentions légales (Impressum)",
    krume: "Mentions légales",
    angaben: [
      ["Éditeur (nom / société, forme juridique)", "RenteKannMehr GbR"],
      ["Adresse", "Rheinold-Tiling-Weg 49, 49088 Osnabrück"],
      ["Qui peut représenter l'entreprise (représentants légaux)", "Carl Buermeyer et Jonas Scheinert (associés)"],
      ["E-mail", "info@rentekannmehr.de"],
      ["Téléphone ou autre moyen de contact rapide", "+49 178 2971395"],
      ["Responsable du contenu (§ 18 Abs. 2 MStV)", "Carl Buermeyer, Rheinold-Tiling-Weg 49, 49088 Osnabrück"],
    ],
  },
} satisfies Record<Lang, unknown>;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  return {
    title: T[lang].metaTitel,
    alternates: alternativen(lang, "/impressum"),
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
          <div className="table-wrap">
            <table>
              <tbody>
                {t.angaben.map(([label, wert = ""]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {/* Noch fehlende Angaben stehen in eckigen Klammern und werden als Platzhalter markiert. */}
                    <td>
                      {wert.startsWith("[") ? <span className="ph">{wert}</span>
                        : wert.includes("@") ? <a href={`mailto:${wert}`}>{wert}</a>
                        : wert.startsWith("+") ? <a href={`tel:${wert.replace(/\s/g, "")}`}>{wert}</a>
                        : wert}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
