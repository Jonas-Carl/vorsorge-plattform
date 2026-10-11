import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtikelKarte, CtaRechner, JsonLd, PageHero, QuellenListe } from "@/components/Bausteine";
import { Icon, type IconName } from "@/components/Icon";
import { reform2027 as r } from "@/config/foerderung";
import { site } from "@/config/site";
import { findeArtikel } from "@/content";
import { alternativen, istSprache, pfad, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";
import { berechneZulage } from "@/lib/foerderung";
import { datum, euro } from "@/lib/format";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  const t = texte(lang).reform;
  return { title: t.titel, description: t.text, alternates: alternativen(lang, "/reform-2027") };
}

const z = (b: number, kinder = 0) => berechneZulage({ eigenbeitragJahr: b, kinder, berufseinsteigerbonus: false }).gesamt;

export default async function ReformSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = texte(lang).reform;
  const E = (x: number) => euro(x, lang);
  const vertiefung = [
    "altersvorsorgedepot", "staatliche-foerderung-verstehen", "bestehende-riester-vertraege",
    "auszahlungsphase-und-besteuerung", "garantien-und-ihre-auswirkungen", "haeufige-fragen-zur-reform",
  ].map((s) => findeArtikel(s, lang)).filter((a) => a !== undefined);

  return (
    <>
      <JsonLd
        daten={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: t.titel,
          dateModified: r.geprueftAm,
          inLanguage: lang,
          author: { "@type": "Organization", name: site.name },
          publisher: { "@type": "Organization", name: site.name },
          mainEntityOfPage: `${site.url}/${lang}/reform-2027`,
        }}
      />
      <PageHero lang={lang} eyebrow={t.eyebrow} titel={t.titel} text={t.text} krumen={[{ label: t.eyebrow }]} stand={r.geprueftAm} />

      <section className="section" aria-labelledby="stand-titel">
        <div className="wrap grid grid--2" style={{ gap: "clamp(2rem, 5vw, 5rem)" }}>
          <div className="stack">
            <h2 id="stand-titel">{t.standTitel}</h2>
            <p className="lead">{t.standText}</p>
            <div className="ampel" aria-label={t.ampelTitel}>
              {t.ampel.map((a) => (
                <div key={a.titel} className={`ampel__punkt ampel__punkt--${a.farbe}`}>
                  <b>{a.titel}</b>
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          </div>
          <ol className="timeline">
            {t.zeit.map((e) => (
              <li key={e.iso} data-zukunft={"zukunft" in e && e.zukunft ? "" : undefined}>
                <time dateTime={e.iso}>{e.datum}</time>
                {e.text}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--sand" aria-labelledby="wege-titel">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{t.wegeEyebrow}</p>
            <h2 id="wege-titel">{t.wegeTitel}</h2>
          </div>
          <div className="grid grid--3">
            {t.wege.map((w) => (
              <article key={w.titel} className="card card--pad">
                <span className="card__icon card__icon--gross"><Icon name={w.bild as IconName} size={28} /></span>
                <span className="tag tag--mint">{w.tag}</span>
                <h3>{w.titel}</h3>
                <p>{w.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="geld-titel">
        <div className="wrap stack-lg">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <p className="eyebrow">{t.geldEyebrow}</p>
            <h2 id="geld-titel">{t.geldTitel}</h2>
            <p className="lead">{t.geldText}</p>
          </div>
          <div className="table-wrap">
            <table>
              <caption>{t.tabTitel}</caption>
              <thead>
                <tr>
                  <th scope="col">{t.tabSparen}</th>
                  <th scope="col" className="num">{t.tabOhne}</th>
                  <th scope="col" className="num">{t.tab1}</th>
                  <th scope="col" className="num">{t.tab2}</th>
                </tr>
              </thead>
              <tbody>
                {[120, 300, 360, 600, 1200, 1800].map((b) => (
                  <tr key={b}>
                    <th scope="row">{E(b)} <span className="muted">({E(b / 12)} {t.tabMonat})</span></th>
                    <td className="num">{E(z(b))}</td>
                    <td className="num">{E(z(b, 1))}</td>
                    <td className="num">{E(z(b, 2))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">{t.tabHinweis}</p>

          <div className="table-wrap">
            <table>
              <caption>{t.altNeuTitel}</caption>
              <thead><tr>{t.altNeuKopf.map((k, i) => <th key={i} scope="col">{k}</th>)}</tr></thead>
              <tbody>
                {t.altNeu.map((zeile) => (
                  <tr key={zeile[0]}>
                    {zeile.map((zelle, i) => (i === 0 ? <th key={i} scope="row">{zelle}</th> : <td key={i}>{zelle}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section--sand" aria-labelledby="regeln-titel">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{t.regelnEyebrow}</p>
            <h2 id="regeln-titel">{t.regelnTitel}</h2>
          </div>
          <ul className="kacheln kacheln--4">
            {t.regeln.map((f, i) => (
              <li key={f.titel} className={`kachel kachel--${["sky", "gold", "mint", "rose"][i % 4]}`}>
                <p className="kachel__zahl">{f.zahl}</p>
                <p className="kachel__titel">{f.titel}</p>
                <p className="kachel__text">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="riester-titel">
        <div className="wrap grid grid--2" style={{ gap: "clamp(2rem, 5vw, 5rem)" }}>
          <div className="stack">
            <h2 id="riester-titel">{t.riesterTitel}</h2>
            <p>{t.riesterText}</p>
            <p><Link href={pfad(lang, "/wissen/bestehende-riester-vertraege")} className="link-arrow">{t.riesterLink} <Icon name="arrow" size={16} /></Link></p>
          </div>
          <div className="offen" style={{ marginTop: 0 }}>
            <h3><Icon name="info" size={22} /> {t.offenTitel}</h3>
            <ul>{t.offen.map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className="section section--sand" aria-labelledby="vertiefung-titel">
        <div className="wrap">
          <div className="section-head"><h2 id="vertiefung-titel">{t.vertiefen}</h2></div>
          <div className="grid grid--3">{vertiefung.map((a) => <ArtikelKarte key={a.slug} a={a} lang={lang} />)}</div>
        </div>
      </section>

      <section className="section" aria-labelledby="quellen-titel">
        <div className="wrap stack">
          <h2 id="quellen-titel" style={{ fontSize: "var(--text-2xl)" }}>{t.quellenTitel}</h2>
          <QuellenListe lang={lang} ids={["bgbl-2026-156", "bundestag-kw13-2026", "bundesregierung-faq", "drv-reform", "zfa-faq", "estg-geltend"]} />
          <p className="small muted">
            {t.geprueft} {datum(r.geprueftAm, lang)}.{" "}
            <Link href={pfad(lang, "/quellen-methodik")}>{t.quellenLink}</Link>
          </p>
        </div>
      </section>

      <CtaRechner lang={lang} />
    </>
  );
}
