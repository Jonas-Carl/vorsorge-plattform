import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtikelKarte, CtaRechner, PageHero } from "@/components/Bausteine";
import { site } from "@/config/site";
import { artikel, kategorien, landingpages } from "@/content";
import { alternativen, istSprache, pfad, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  const t = texte(lang).wissen;
  return { title: t.titel, description: t.text, alternates: alternativen(lang, "/wissen") };
}

export default async function WissenSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = texte(lang);
  const alle = artikel(lang);

  return (
    <>
      <PageHero lang={lang} eyebrow={t.nav.wissen} titel={t.wissen.titel} text={t.wissen.text} krumen={[{ label: t.nav.wissen }]} stand={site.inhaltsstand} />

      <nav className="wrap" aria-label={t.wissen.kategorien} style={{ paddingTop: "var(--s-6)" }}>
        <ul className="btn-row" style={{ listStyle: "none" }}>
          {kategorien.map((k, i) => (
            <li key={k}><a className="chip chip--link" href={`#thema-${i}`}>{t.kategorien[k]}</a></li>
          ))}
        </ul>
      </nav>

      <section className="section" aria-labelledby="kurz-titel" style={{ paddingBlock: "var(--s-7)" }}>
        <div className="wrap">
          <div className="section-head" style={{ marginBottom: "var(--s-6)" }}>
            <h2 id="kurz-titel" style={{ fontSize: "var(--text-2xl)" }}>{t.wissen.kurzTitel}</h2>
            <p className="muted">{t.wissen.kurzText}</p>
          </div>
          <ul className="grid grid--2" style={{ listStyle: "none" }}>
            {landingpages(lang).map((l) => (
              <li key={l.slug}>
                <Link href={pfad(lang, `/themen/${l.slug}`)} className="card">
                  <h3 style={{ fontSize: "var(--text-lg)" }}>{l.frage}</h3>
                  <p className="small">{l.kurz}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {kategorien.map((k, i) => (
        <section key={k} id={`thema-${i}`} className={`section ${i % 2 ? "" : "section--sand"}`} aria-labelledby={`kat-${i}`} style={{ paddingBlock: "var(--s-8)" }}>
          <div className="wrap">
            <div className="section-head" style={{ marginBottom: "var(--s-6)" }}>
              <h2 id={`kat-${i}`} style={{ fontSize: "var(--text-2xl)" }}>{t.kategorien[k]}</h2>
              <p className="muted">{t.kategorieText[k]}</p>
            </div>
            <div className="grid grid--3">
              {alle.filter((a) => a.kategorie === k).map((a) => <ArtikelKarte key={a.slug} a={a} lang={lang} />)}
            </div>
          </div>
        </section>
      ))}
      <CtaRechner lang={lang} />
    </>
  );
}
