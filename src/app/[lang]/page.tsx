import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtikelKarte, BeratungCta, CtaRechner, Faq, JsonLd, organisation, PartnerKarte } from "@/components/Bausteine";
import { Calculator } from "@/components/Calculator";
import { HeroKarte } from "@/components/HeroKarte";
import { Icon, type IconName } from "@/components/Icon";
import { partner } from "@/config/partner";
import { site } from "@/config/site";
import { findeArtikel, startseitenFaq } from "@/content";
import { istSprache, pfad, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";
import "../start.css";

const schrittBilder: IconName[] = ["coins", "gift", "sprout", "sun"];
/** Akzentfarben der Startseite im Wechsel: Mint, Himmelblau, Lavendel. */
const akzent = (i: number) => ["mint", "sky", "lav"][i % 3];

export default async function Startseite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = texte(lang).start;
  const n = texte(lang).neu;
  const h = texte(lang).hero2;
  const mehr = texte(lang).allgemein.mehr;
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

      {/* Kopfbereich */}
      <section className="held">
        <div className="wrap held__in">
          <div className="held__text">
            <p className="held__eyebrow">{h.eyebrow}</p>
            <h1>
              {h.h1a} <span className="held__akzent">{h.h1b}</span>
            </h1>
            <p className="held__sub">{h.sub}</p>
            <div className="held__aktion">
              <a href="#rechner" className="btn btn--start">{h.cta1} <Icon name="arrow" size={20} /></a>
              <a href="#so-gehts" className="held__link">{h.cta2}</a>
            </div>
            <ul className="held__chips">
              {h.chips.map((c) => (
                <li key={c}><Icon name="checkCircle" size={22} /> {c}</li>
              ))}
            </ul>
          </div>
          <div className="held__bild"><HeroKarte lang={lang} /></div>
        </div>
      </section>

      {/* Drei Vorteile */}
      <section className="vorteile-band" aria-label={h.vorteileLabel}>
        <ul className="wrap vorteile3">
          {h.vorteile.map((v, i) => (
            <li key={v.titel}>
              <a href={v.link} className={`vorteil vorteil--${akzent(i)}`}>
                <span className="vorteil__bild"><Icon name={v.bild as IconName} size={28} /></span>
                <h2>{v.titel}</h2>
                <p>{v.text}</p>
              </a>
            </li>
          ))}
        </ul>
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
          <p className="beispiel-hinweis"><Icon name="info" size={18} /> {h.beispielHinweis}</p>
          <BeratungCta lang={lang} />
        </div>
      </section>

      {/* So funktioniert es */}
      <section className="section section--hauch" id="so-gehts" aria-labelledby="schritte-titel">
        <div className="wrap">
          <div className="section-head section-head--mitte">
            <h2 id="schritte-titel">{t.schritteTitel}</h2>
            <p className="lead">{t.schritteSub}</p>
          </div>
          <ol className="weg">
            {t.schritte.map((s, i) => (
              <li key={s.titel} className={`weg--${akzent(i)}`}>
                <span className="weg__bild" data-nr={i + 1}><Icon name={schrittBilder[i] ?? "check"} size={34} /></span>
                <h3>{s.titel}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Was ist RenteKannMehr? */}
      <section className="section" aria-labelledby="was-titel">
        <div className="wrap was">
          <div className="stack">
            <p className="eyebrow">{h.wasEyebrow}</p>
            <h2 id="was-titel">{h.wasTitel}</h2>
            <p className="lead">{h.wasText}</p>
          </div>
          <div className="was__karte">
            <ul className="haken">{h.was.map((x) => <li key={x}>{x}</li>)}</ul>
            <Link href={pfad(lang, "/transparenz")} className="link-arrow">{h.wasLink} <Icon name="arrow" size={16} /></Link>
          </div>
        </div>
      </section>

      {/* Das steht schon fest */}
      <section className="section section--hauch" aria-labelledby="fest-titel">
        <div className="wrap">
          <div className="section-head section-head--mitte">
            <p className="eyebrow">{t.festEyebrow}</p>
            <h2 id="fest-titel">{t.festTitel}</h2>
            <p className="lead">{t.festSub}</p>
          </div>
          <ul className="kacheln">
            {t.fest.map((f, i) => (
              <li key={f.titel} className={`kachel kachel--${akzent(i)}`}>
                <p className="kachel__zahl">{f.zahl}</p>
                <p className="kachel__titel">{f.titel}</p>
                <p className="kachel__text">{f.text}</p>
              </li>
            ))}
          </ul>
          <p className="small muted" style={{ marginTop: "1.25rem", textAlign: "center" }}>
            {t.festQuelle}{" "}
            <Link href={pfad(lang, "/reform-2027")} className="link-arrow">{mehr} <Icon name="arrow" size={16} /></Link>
          </p>

          <div className="offen">
            <h3><Icon name="info" size={22} /> {t.offenTitel}</h3>
            <ul>{t.offen.map((o) => <li key={o}>{o}</li>)}</ul>
          </div>
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
                <Link href={pfad(lang, w.link)} className={`wer__karte wer__karte--${akzent(i)}`}>
                  <span className="wer__bild"><Icon name={w.bild as IconName} size={30} /></span>
                  <h3>{w.titel}</h3>
                  <p>{w.text}</p>
                  <span className="wer__mehr">{mehr} <Icon name="arrow" size={16} /></span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="small muted" style={{ marginTop: "var(--s-5)", textAlign: "center" }}>{n.werHinweis}</p>
        </div>
      </section>

      {/* Lexikon – eingeklappt, damit die Seite ruhig bleibt */}
      <section className="section section--hauch section--klapp" aria-labelledby="woerter-titel">
        <div className="wrap">
          <details className="klapp">
            <summary>
              <span>
                <span className="eyebrow">{t.woerterEyebrow}</span>
                <span className="klapp__titel" id="woerter-titel" role="heading" aria-level={2}>{t.woerterTitel}</span>
              </span>
              <span className="klapp__knopf" aria-hidden="true" />
            </summary>
            <dl className="lexikon">
              {t.woerter.map((w) => (
                <div key={w.wort}>
                  <dt>{w.wort}</dt>
                  <dd>{w.text}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </section>

      {/* Wissen */}
      <section className="section" aria-labelledby="wissen-titel">
        <div className="wrap">
          <div className="section-head section-head--mitte">
            <p className="eyebrow">{t.wissenEyebrow}</p>
            <h2 id="wissen-titel">{t.wissenTitel}</h2>
          </div>
          <div className="grid grid--3">
            {vorschau.map((a) => <ArtikelKarte key={a.slug} a={a} lang={lang} />)}
          </div>
          <p style={{ marginTop: "2rem", textAlign: "center" }}>
            <Link href={pfad(lang, "/wissen")} className="link-arrow">{t.wissenAlle} <Icon name="arrow" size={16} /></Link>
          </p>
        </div>
      </section>

      {/* Partner – eingeklappt, solange es nur Platzhalter gibt */}
      <section className="section section--hauch section--klapp" aria-labelledby="partner-titel">
        <div className="wrap">
          <details className="klapp">
            <summary>
              <span>
                <span className="eyebrow">{t.partnerEyebrow}</span>
                <span className="klapp__titel" id="partner-titel" role="heading" aria-level={2}>{t.partnerTitel}</span>
              </span>
              <span className="klapp__knopf" aria-hidden="true" />
            </summary>
            <p className="lead" style={{ marginBottom: "var(--s-5)" }}>{t.partnerSub}</p>
            <div className="grid grid--4">
              {partner.map((p, i) => <PartnerKarte key={p.id} p={p} nr={i + 1} lang={lang} />)}
            </div>
          </details>
          <p style={{ marginTop: "1.5rem" }}>
            <Link href={pfad(lang, "/partner")} className="link-arrow">{t.partnerLink} <Icon name="arrow" size={16} /></Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" aria-labelledby="faq-titel">
        <div className="wrap">
          <div className="section-head section-head--mitte">
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
