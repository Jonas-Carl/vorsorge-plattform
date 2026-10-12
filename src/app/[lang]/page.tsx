import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtikelKarte, BeratungCta, CtaRechner, Faq, JsonLd, organisation, PartnerKarte } from "@/components/Bausteine";
import { Calculator } from "@/components/Calculator";
import { HeroVisual } from "@/components/HeroVisual";
import { Icon, type IconName } from "@/components/Icon";
import { partner } from "@/config/partner";
import { site } from "@/config/site";
import { findeArtikel, startseitenFaq } from "@/content";
import { istSprache, pfad, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";
import "../start.css";

const schrittBilder: IconName[] = ["coins", "gift", "sprout", "sun"];
const festFarben = ["gold", "mint", "rose", "sky", "sand", "petrol"];

export default async function Startseite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = texte(lang).start;
  const n = texte(lang).neu;
  const h = texte(lang).hero2;
  const faq = startseitenFaq(lang);
  const vorschau = ["private-altersvorsorge-einfach-erklaert", "staatliche-foerderung-verstehen", "altersvorsorgedepot"]
    .map((s) => findeArtikel(s, lang))
    .filter((a) => a !== undefined);

  return (
    <div className="start">
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
            <p className="eyebrow">{h.eyebrow}</p>
            <h1>{h.h1}</h1>
            <p className="hero__sub">{h.sub}</p>
            <div className="btn-row">
              <a href="#rechner" className="btn btn--primary">{h.cta1} <Icon name="arrow" size={18} /></a>
              <a href="#so-gehts" className="btn btn--ghost">{h.cta2}</a>
            </div>
            <ul className="hero__facts">
              {h.chips.map((c) => <li key={c}><Icon name="check" size={16} /> {c}</li>)}
            </ul>
          </div>
          <HeroVisual lang={lang} />
        </div>
        <div className="wrap hero__nach">
          <ul className="vorteile">
            {n.zahlen.map((z) => (
              <li key={z.text}><b>{z.zahl}</b><span>{z.text}</span></li>
            ))}
          </ul>
          <small>{h.vorteilHinweis}</small>
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
          <div className="rechner-buehne">
            <Calculator lang={lang} kompakt />
          </div>
          <BeratungCta lang={lang} />
        </div>
      </section>

      {/* Für wen ist das? */}
      <section className="section" aria-labelledby="wer-titel">
        <div className="wrap">
          <div className="section-head section-head--mitte">
            <p className="eyebrow">{n.werEyebrow}</p>
            <h2 id="wer-titel">{n.werTitel}</h2>
            <p className="lead">{n.werSub}</p>
          </div>
          <ul className="wer">
            {n.wer.map((w, i) => (
              <li key={w.titel}>
                <Link href={pfad(lang, w.link)} className={`wer__karte wer__karte--${festFarben[i % festFarben.length]}`}>
                  <span className="wer__bild"><Icon name={w.bild as IconName} size={30} /></span>
                  <h3>{w.titel}</h3>
                  <p>{w.text}</p>
                  <span className="wer__mehr">{texte(lang).allgemein.mehr} <Icon name="arrow" size={16} /></span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="small muted" style={{ marginTop: "var(--s-5)", textAlign: "center" }}>{n.werHinweis}</p>
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
      <section className="section section--mint" aria-labelledby="woerter-titel">
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
    </div>
  );
}
