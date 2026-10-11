import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtikelKarte, CtaRechner, Faq, JsonLd, organisation, PartnerKarte } from "@/components/Bausteine";
import { Calculator } from "@/components/Calculator";
import { Icon, Muenzen, type IconName } from "@/components/Icon";
import { partner } from "@/config/partner";
import { site } from "@/config/site";
import { findeArtikel, startseitenFaq } from "@/content";
import { istSprache, pfad, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";

const schrittBilder: IconName[] = ["coins", "gift", "sprout", "sun"];
const festFarben = ["gold", "mint", "rose", "sky", "sand", "petrol"];

export default async function Startseite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = texte(lang).start;
  const faq = startseitenFaq(lang);
  const vorschau = ["private-altersvorsorge-einfach-erklaert", "staatliche-foerderung-verstehen", "altersvorsorgedepot"]
    .map((s) => findeArtikel(s, lang))
    .filter((a) => a !== undefined);

  return (
    <>
      <JsonLd
        daten={{
          "@context": "https://schema.org",
          "@graph": [
            { ...organisation, "@id": `${site.url}/#organisation` },
            { "@type": "WebSite", name: site.name, url: `${site.url}/${lang}`, inLanguage: lang, publisher: { "@id": `${site.url}/#organisation` } },
            {
              "@type": "FAQPage",
              mainEntity: faq.map((f) => ({
                "@type": "Question",
                name: f.frage,
                acceptedAnswer: { "@type": "Answer", text: f.antwort.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") },
              })),
            },
          ],
        }}
      />

      {/* Hero */}
      <section className="hero">
        <div className="wrap hero__in">
          <div>
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>
              {t.h1a}
              <br />
              <em>{t.h1b}</em>
            </h1>
            <p className="hero__sub">{t.sub}</p>
            <div className="btn-row">
              <a href="#rechner" className="btn btn--light">{t.cta1} <Icon name="arrow" size={18} /></a>
              <a href="#so-gehts" className="btn btn--ghost-light">{t.cta2}</a>
            </div>
            <ul className="hero__facts">
              {t.chips.map((c) => <li key={c}><Icon name="check" size={16} /> {c}</li>)}
            </ul>
          </div>
          <div className="hero__bild">
            <Muenzen links={t.muenze1} rechts={t.muenze2} />
            <p className="hero__fussnote">{t.fussnote}</p>
          </div>
        </div>
      </section>

      {/* Rechner */}
      <section className="section section--rechner" id="rechner" aria-labelledby="rechner-titel">
        <div className="wrap">
          <div className="section-head section-head--mitte">
            <p className="eyebrow">{t.rechnerEyebrow}</p>
            <h2 id="rechner-titel">{t.rechnerTitel}</h2>
            <p className="lead">{t.rechnerSub}</p>
          </div>
          <Calculator lang={lang} kompakt />
        </div>
      </section>

      {/* So funktioniert es */}
      <section className="section section--sand" id="so-gehts" aria-labelledby="schritte-titel">
        <div className="wrap">
          <div className="section-head section-head--mitte">
            <h2 id="schritte-titel">{t.schritteTitel}</h2>
            <p className="lead">{t.schritteSub}</p>
          </div>
          <ol className="weg">
            {t.schritte.map((s, i) => (
              <li key={s.titel}>
                <span className="weg__bild" data-nr={i + 1}><Icon name={schrittBilder[i] ?? "check"} size={34} /></span>
                <h3>{s.titel}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Das steht schon fest */}
      <section className="section" aria-labelledby="fest-titel">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{t.festEyebrow}</p>
            <h2 id="fest-titel">{t.festTitel}</h2>
            <p className="lead">{t.festSub}</p>
          </div>
          <ul className="kacheln">
            {t.fest.map((f, i) => (
              <li key={f.titel} className={`kachel kachel--${festFarben[i % festFarben.length]}`}>
                <p className="kachel__zahl">{f.zahl}</p>
                <p className="kachel__titel">{f.titel}</p>
                <p className="kachel__text">{f.text}</p>
              </li>
            ))}
          </ul>
          <p className="small muted" style={{ marginTop: "1rem" }}>
            {t.festQuelle}{" "}
            <Link href={pfad(lang, "/reform-2027")} className="link-arrow">{texte(lang).allgemein.mehr} <Icon name="arrow" size={16} /></Link>
          </p>

          <div className="offen">
            <h3><Icon name="info" size={22} /> {t.offenTitel}</h3>
            <ul>{t.offen.map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* Lexikon */}
      <section className="section section--navy" aria-labelledby="woerter-titel">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{t.woerterEyebrow}</p>
            <h2 id="woerter-titel">{t.woerterTitel}</h2>
          </div>
          <dl className="lexikon">
            {t.woerter.map((w) => (
              <div key={w.wort}>
                <dt>{w.wort}</dt>
                <dd>{w.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Wissen */}
      <section className="section" aria-labelledby="wissen-titel">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{t.wissenEyebrow}</p>
            <h2 id="wissen-titel">{t.wissenTitel}</h2>
          </div>
          <div className="grid grid--3">
            {vorschau.map((a) => <ArtikelKarte key={a.slug} a={a} lang={lang} />)}
          </div>
          <p style={{ marginTop: "2rem" }}>
            <Link href={pfad(lang, "/wissen")} className="link-arrow">{t.wissenAlle} <Icon name="arrow" size={16} /></Link>
          </p>
        </div>
      </section>

      {/* Partner */}
      <section className="section section--sand" aria-labelledby="partner-titel">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{t.partnerEyebrow}</p>
            <h2 id="partner-titel">{t.partnerTitel}</h2>
            <p className="lead">{t.partnerSub}</p>
          </div>
          <div className="grid grid--4">
            {partner.map((p, i) => <PartnerKarte key={p.id} p={p} nr={i + 1} lang={lang} />)}
          </div>
          <p style={{ marginTop: "2rem" }}>
            <Link href={pfad(lang, "/partner")} className="link-arrow">{t.partnerLink} <Icon name="arrow" size={16} /></Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" aria-labelledby="faq-titel">
        <div className="wrap grid" style={{ gap: "var(--s-7)" }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <p className="eyebrow">{t.faqEyebrow}</p>
            <h2 id="faq-titel">{t.faqTitel}</h2>
          </div>
          <Faq eintraege={faq} lang={lang} />
        </div>
      </section>

      <CtaRechner lang={lang} />
    </>
  );
}
