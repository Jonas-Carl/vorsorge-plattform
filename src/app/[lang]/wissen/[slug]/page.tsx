import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { ArtikelKarte, JsonLd, PageHero, QuellenListe } from "@/components/Bausteine";
import { Icon } from "@/components/Icon";
import { site } from "@/config/site";
import { artikelSlugs, findeArtikel } from "@/content";
import { alternativen, istSprache, pfad, sprachen } from "@/i18n";
import { texte } from "@/i18n/texte";
import { datum } from "@/lib/format";

type Props = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return sprachen.flatMap((lang) => artikelSlugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!istSprache(lang)) return {};
  const a = findeArtikel(slug, lang);
  if (!a) return {};
  return {
    title: a.titel,
    description: a.kurz,
    alternates: alternativen(lang, `/wissen/${a.slug}`),
    openGraph: { title: a.titel, description: a.kurz, type: "article", modifiedTime: a.stand },
  };
}

export default async function ArtikelSeite({ params }: Props) {
  const { lang, slug } = await params;
  if (!istSprache(lang)) notFound();
  const a = findeArtikel(slug, lang);
  if (!a) notFound();
  const t = texte(lang);
  const verwandt = a.verwandt.map((s) => findeArtikel(s, lang)).filter((x) => x !== undefined);

  return (
    <>
      <JsonLd
        daten={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: a.titel,
              description: a.kurz,
              dateModified: a.stand,
              inLanguage: lang,
              articleSection: t.kategorien[a.kategorie],
              author: { "@type": "Organization", name: site.name, url: `${site.url}/${lang}/ueber-uns` },
              publisher: { "@type": "Organization", name: site.name },
              mainEntityOfPage: `${site.url}/${lang}/wissen/${a.slug}`,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: t.allgemein.start, item: `${site.url}/${lang}` },
                { "@type": "ListItem", position: 2, name: t.nav.wissen, item: `${site.url}/${lang}/wissen` },
                { "@type": "ListItem", position: 3, name: a.titel },
              ],
            },
          ],
        }}
      />
      <PageHero
        lang={lang}
        eyebrow={t.kategorien[a.kategorie]}
        titel={a.titel}
        krumen={[{ href: "/wissen", label: t.nav.wissen }, { label: a.titel }]}
      />
      <div className="section" style={{ paddingTop: "var(--s-7)" }}>
        <div className="wrap article-layout">
          <article>
            <div className="kurz-gesagt">
              <p className="kurz-gesagt__label">{t.allgemein.kurzGesagt}</p>
              <p>{a.einfach}</p>
            </div>
            <p className="small muted" style={{ marginBlock: "var(--s-5)" }}>
              {t.allgemein.stand}: {datum(a.stand, lang)} · {a.lesezeitMin} {t.allgemein.minuten} · {site.name} {t.allgemein.redaktion}
            </p>
            <p className="eyebrow" style={{ marginBottom: "var(--s-4)" }}>{t.wissen.genauer}</p>
            <ArticleBody bloecke={a.bloecke} lang={lang} />
            {/* Nur, wenn der Artikel nicht schon selbst zum Berater verlinkt */}
            {!a.bloecke.some((b) => b.t === "knopf" && b.href === "/partner") && (
            <section className="prose artikel-frage" aria-labelledby="artikel-frage">
              <h2 id="artikel-frage">{t.neu.artikelBeratungTitel}</h2>
              <p>{t.neu.artikelBeratungText}</p>
              <p>
                <Link href={pfad(lang, "/partner")} className="btn btn--primary">
                  {t.neu.artikelBeratungKnopf} <Icon name="arrow" size={18} />
                </Link>
              </p>
            </section>
            )}
          </article>
          <aside className="article-aside">
            <div className="card">
              <h2 style={{ fontSize: "var(--text-lg)" }}>{t.wissen.selbst}</h2>
              <p className="small">{t.wissen.selbstText}</p>
              <Link href={pfad(lang, "/rechner")} className="btn btn--primary" style={{ width: "100%" }}>{t.allgemein.zumRechner}</Link>
            </div>
            {a.quellen.length > 0 ? (
              <div className="stack">
                <h2 style={{ fontSize: "var(--text-lg)" }}>{t.allgemein.quellen}</h2>
                <QuellenListe ids={a.quellen} lang={lang} />
              </div>
            ) : (
              <p className="small muted">{t.wissen.ohneQuellen}</p>
            )}
            <p className="small muted">
              {t.wissen.keineBeratung}{" "}
              <Link href={pfad(lang, "/quellen-methodik")}>{t.wissen.soArbeiten}</Link>
            </p>
          </aside>
        </div>
      </div>
      {verwandt.length > 0 && (
        <section className="section section--sand" aria-labelledby="verwandt-titel">
          <div className="wrap">
            <div className="section-head"><h2 id="verwandt-titel" style={{ fontSize: "var(--text-2xl)" }}>{t.wissen.passend}</h2></div>
            <div className="grid grid--3">{verwandt.map((v) => <ArtikelKarte key={v.slug} a={v} lang={lang} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
