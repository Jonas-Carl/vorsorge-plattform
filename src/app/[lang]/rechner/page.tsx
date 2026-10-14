import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtikelKarte, BeratungCta, JsonLd, PageHero } from "@/components/Bausteine";
import { Calculator } from "@/components/Calculator";
import { site } from "@/config/site";
import { findeArtikel } from "@/content";
import { alternativen, istSprache, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  const t = texte(lang);
  return {
    title: t.rechner.metaTitel,
    description: t.rechner.seitenText,
    alternates: alternativen(lang, "/rechner"),
  };
}

export default async function RechnerSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = texte(lang);
  const r = t.rechner;
  const weiter = ["so-funktioniert-der-rechner", "annahmen-hinter-den-berechnungen", "risiken-von-kapitalmarktanlagen"]
    .map((s) => findeArtikel(s, lang))
    .filter((a) => a !== undefined);

  return (
    <>
      <JsonLd
        daten={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${site.name} – ${t.nav.rechner}`,
          url: `${site.url}/${lang}/rechner`,
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web",
          inLanguage: lang,
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        }}
      />
      <PageHero lang={lang} eyebrow={t.nav.rechner} titel={r.seitenTitel} text={r.seitenText} krumen={[{ label: t.nav.rechner }]} />

      <section className="section section--rechner" aria-label={t.nav.rechner} style={{ paddingTop: "var(--s-7)" }}>
        <div className="wrap stack-lg">
          <p className="note">{r.hinweis}</p>
          <Calculator lang={lang} />
          <BeratungCta lang={lang} />
        </div>
      </section>

      <section className="section section--sand" aria-labelledby="was-titel">
        <div className="wrap grid grid--2" style={{ gap: "clamp(2rem, 5vw, 5rem)" }}>
          <div className="stack">
            <h2 id="was-titel">{r.wasTitel}</h2>
            <ul className="haken">{r.was.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="stack">
            <h2>{r.grenzenTitel}</h2>
            <ul className="haken">{r.grenzen.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="mehr-titel">
        <div className="wrap">
          <div className="section-head"><h2 id="mehr-titel">{r.mehrLesen}</h2></div>
          <div className="grid grid--3">{weiter.map((a) => <ArtikelKarte key={a.slug} a={a} lang={lang} />)}</div>
        </div>
      </section>
    </>
  );
}
