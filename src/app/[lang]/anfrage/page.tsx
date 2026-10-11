import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/Bausteine";
import { LeadForm } from "@/components/LeadForm";
import { alternativen, istSprache, pfad, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  const t = texte(lang).anfrage;
  return { title: t.titel, description: t.text, alternates: alternativen(lang, "/anfrage") };
}

export default async function AnfrageSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = texte(lang);
  const a = t.anfrage;

  return (
    <>
      <PageHero lang={lang} eyebrow={a.eyebrow} titel={a.titel} text={a.text} krumen={[{ label: a.eyebrow }]} />
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
            <p className="small muted">
              <Link href={pfad(lang, "/partner")}>{t.footer.links.partner}</Link> ·{" "}
              <Link href={pfad(lang, "/transparenz")}>{t.footer.links.transparenz}</Link> ·{" "}
              <Link href={pfad(lang, "/datenschutz")}>{t.footer.links.datenschutz}</Link>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
