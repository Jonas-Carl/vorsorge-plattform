import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtikelKarte, BeratungCta, PageHero } from "@/components/Bausteine";
import { Calculator } from "@/components/Calculator";
import { Icon } from "@/components/Icon";
import { site } from "@/config/site";
import { findeArtikel, landingpages, landingpageSlugs } from "@/content";
import { alternativen, istSprache, pfad, sprachen } from "@/i18n";
import { texte } from "@/i18n/texte";

/**
 * Themen-Landingpages für Kampagnen. Eine neue Seite entsteht durch einen
 * weiteren Eintrag in `landingpages` (src/content/index.ts) – ohne neuen Code.
 */
type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return sprachen.flatMap((lang) => landingpageSlugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!istSprache(lang)) return {};
  const l = landingpages(lang).find((x) => x.slug === slug);
  if (!l) return {};
  return { title: l.frage, description: l.kurz, alternates: alternativen(lang, `/themen/${l.slug}`) };
}

export default async function Themenseite({ params }: Props) {
  const { lang, slug } = await params;
  if (!istSprache(lang)) notFound();
  const l = landingpages(lang).find((x) => x.slug === slug);
  if (!l) notFound();
  const t = texte(lang).themen;
  const passend = l.artikel.map((s) => findeArtikel(s, lang)).filter((x) => x !== undefined);

  return (
    <>
      <PageHero lang={lang} eyebrow={t.eyebrow} titel={l.frage} text={l.kurz} stand={site.inhaltsstand} />
      <section className="section" aria-label={t.eyebrow}>
        <div className="wrap stack-lg" style={{ maxWidth: "52rem" }}>
          <div className="stack">
            {l.antwort.map((p) => <p key={p} className="lead">{p}</p>)}
          </div>
          <ul className="haken">
            {l.punkte.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <div className="btn-row">
            {l.einstieg === "rechner" ? (
              <Link href={pfad(lang, "/rechner")} className="btn btn--primary">{t.zumRechner} <Icon name="arrow" size={18} /></Link>
            ) : (
              <Link href={pfad(lang, `/wissen/${l.artikel[0]}`)} className="btn btn--primary">{t.nachlesen} <Icon name="arrow" size={18} /></Link>
            )}
            <Link href={pfad(lang, "/reform-2027")} className="btn btn--ghost">{t.reform}</Link>
          </div>
          <p className="small muted">{t.hinweis}</p>
        </div>
      </section>
      <section className="section section--rechner" aria-labelledby="themen-rechner">
        <div className="wrap">
          <div className="section-head section-head--mitte">
            <h2 id="themen-rechner">{texte(lang).start.rechnerTitel}</h2>
          </div>
          <Calculator lang={lang} kompakt />
          <BeratungCta lang={lang} />
        </div>
      </section>
      <section className="section section--sand" aria-labelledby="mehr-titel">
        <div className="wrap">
          <div className="section-head"><h2 id="mehr-titel" style={{ fontSize: "var(--text-2xl)" }}>{t.mehr}</h2></div>
          <div className="grid grid--3">{passend.map((a) => <ArtikelKarte key={a.slug} a={a} lang={lang} />)}</div>
        </div>
      </section>
    </>
  );
}
