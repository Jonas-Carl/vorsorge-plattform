import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/Bausteine";
import { LeadForm } from "@/components/LeadForm";
import { aktivePartner } from "@/config/partner";
import { alternativen, istSprache, pfad, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  const n = texte(lang).neu;
  return { title: n.partnerTitel, description: n.partnerText, alternates: alternativen(lang, "/partner") };
}

/**
 * Beratung anfragen: Das Formular steht direkt auf der Seite. Mit der Einwilligung im Formular
 * geben wir die Anfrage an einen passenden Berater aus der Partnerliste weiter (Liste unten).
 */
export default async function PartnerSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = texte(lang).partner;
  const n = texte(lang).neu;
  const a = texte(lang).anfrage;
  const liste = aktivePartner();

  return (
    <>
      <PageHero lang={lang} eyebrow={t.eyebrow} titel={n.partnerTitel} text={n.partnerText} krumen={[{ label: t.eyebrow }]} />

      <section className="section" aria-label={a.eyebrow} style={{ paddingTop: "var(--s-7)" }}>
        <div className="wrap article-layout">
          <LeadForm lang={lang} />
          <aside className="article-aside">
            <div className="card">
              <h2 style={{ fontSize: "var(--text-lg)" }}>{a.ablaufTitel}</h2>
              <ol className="small" style={{ paddingLeft: "1.2rem", display: "grid", gap: "0.5rem" }}>
                {a.ablauf.map((x) => <li key={x}>{x}</li>)}
              </ol>
            </div>
            <div className="note">
              <h4>{a.keineBeratungTitel}</h4>
              <p>{a.keineBeratung}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* Partnerliste – auf sie verweist die Einwilligung im Formular */}
      <section className="section" id="partnerliste" aria-labelledby="partnerliste-titel" style={{ paddingTop: 0 }}>
        <div className="wrap stack" style={{ maxWidth: "48rem" }}>
          <h2 id="partnerliste-titel">{t.listeTitel}</h2>
          <p>{t.listeText}</p>
          {liste.length === 0 ? (
            <p className="note">{t.listeLeer}</p>
          ) : (
            <ul className="partnerliste">
              {liste.map((p) => (
                <li key={p.id}><strong>{p.name}</strong> – {p.beschreibung}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="section section--sand" aria-labelledby="regeln-titel">
        <div className="wrap grid grid--2" style={{ gap: "clamp(2rem, 5vw, 5rem)" }}>
          <div className="stack">
            <h2 id="regeln-titel">{t.regelnTitel}</h2>
            <ul className="haken">{t.regeln.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="stack">
            <h2>{t.nichtTitel}</h2>
            <p>{t.nichtText}</p>
            <p className="small muted">
              {t.partnerWerden} <Link href={pfad(lang, "/kontakt")}>{t.alsPartner}</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
