import Link from "next/link";
import { istAuswaehlbar, type Partner } from "@/config/partner";
import { quelle } from "@/config/quellen";
import { site } from "@/config/site";
import type { Artikel } from "@/content/typen";
import { pfad, type Lang } from "@/i18n";
import { texte } from "@/i18n/texte";
import { datum } from "@/lib/format";
import { Inline } from "./ArticleBody";
import { Icon } from "./Icon";

type Krume = { href?: string; label: string };

export function PageHero({
  lang, eyebrow, titel, text, krumen, stand,
}: { lang: Lang; eyebrow?: string; titel: string; text?: string; krumen?: Krume[]; stand?: string }) {
  const t = texte(lang).allgemein;
  return (
    <header className="page-hero">
      <div className="wrap">
        {krumen && (
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href={pfad(lang, "/")}>{t.start}</Link></li>
              {krumen.map((k) => (
                <li key={k.label} aria-current={k.href ? undefined : "page"}>
                  {k.href ? <Link href={pfad(lang, k.href)}>{k.label}</Link> : k.label}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{titel}</h1>
        {text && <p>{text}</p>}
        {stand && <p className="page-hero__meta">{t.stand}: {datum(stand, lang)}</p>}
      </div>
    </header>
  );
}

export function Faq({ eintraege, lang }: { eintraege: { frage: string; antwort: string }[]; lang: Lang }) {
  return (
    <div className="faq">
      {eintraege.map((e) => (
        <details key={e.frage}>
          <summary>{e.frage}</summary>
          <div className="faq__a"><p><Inline text={e.antwort} lang={lang} /></p></div>
        </details>
      ))}
    </div>
  );
}

export function ArtikelKarte({ a, lang }: { a: Artikel; lang: Lang }) {
  const t = texte(lang);
  return (
    <Link href={pfad(lang, `/wissen/${a.slug}`)} className="card">
      <span className="tag tag--petrol">{t.kategorien[a.kategorie]}</span>
      <h3>{a.titel}</h3>
      <p className="small">{a.einfach}</p>
      <p className="small muted">{a.lesezeitMin} {t.allgemein.minuten}</p>
    </Link>
  );
}

export function QuellenListe({ ids, lang }: { ids: string[]; lang: Lang }) {
  if (ids.length === 0) return null;
  const t = texte(lang).allgemein;
  return (
    <ul className="source-list">
      {ids.map((id) => {
        const q = quelle(id);
        return (
          <li key={id}>
            <a href={q.url} target="_blank" rel="noopener noreferrer" lang="de">{q.titel}</a>
            <br />
            <span className="muted"><span lang="de">{q.herausgeber}</span> · {t.abgerufen} {datum(q.abgerufen, lang)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Neutraler Partnerplatz. Zeigt Platzhalter-Kennungen, solange keine Kooperation besteht. */
export function PartnerKarte({ p, nr, lang, auswahl = false }: { p: Partner; nr: number; lang: Lang; auswahl?: boolean }) {
  const t = texte(lang).partner;
  const n = texte(lang).neu;
  const platzhalter = p.status === "platzhalter";
  const kennung = `PARTNER_${String(nr).padStart(2, "0")}`;
  return (
    <article className="partner" aria-label={platzhalter ? t.platz(nr) : p.name}>
      <div className="partner__logo">
        {/* Partnerlogos sind kleine, meist vektorbasierte Dateien – bewusst ohne Bildoptimierung. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.logo ? <img src={p.logo} alt={`Logo ${p.name}`} height={48} /> : `[${kennung}_LOGO]`}
      </div>
      <div className="btn-row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ fontSize: "var(--text-lg)" }}>{platzhalter ? t.platz(nr) : p.name}</h3>
        <span className="tag tag--gold">{platzhalter ? t.frei : p.status}</span>
      </div>
      <dl>
        <div><dt>{t.felder.name}</dt><dd><code>{p.name}</code></dd></div>
        <div><dt>{t.felder.beschreibung}</dt><dd><code>{p.beschreibung}</code></dd></div>
        <div><dt>{t.felder.leistungen}</dt><dd>{p.leistungen.map((l) => <code key={l}>{l}</code>)}</dd></div>
        <div><dt>{n.wo}</dt><dd><code>{p.region}</code></dd></div>
        <div><dt>{t.felder.zielgruppe}</dt><dd><code>{p.zielgruppe}</code></dd></div>
        <div><dt>{t.felder.kontakt}</dt><dd><code>{p.kontakt.url ?? `[${kennung}_KONTAKTLINK]`}</code></dd></div>
        <div><dt>{t.felder.transparenz}</dt><dd><code>{p.transparenzhinweis}</code></dd></div>
      </dl>
      {auswahl &&
        (istAuswaehlbar(p) ? (
          <Link href={`${pfad(lang, "/anfrage")}?partner=${p.id}`} className="btn btn--primary">{n.waehlen}</Link>
        ) : (
          <button type="button" className="btn btn--ghost" disabled>{n.nichtDa}</button>
        ))}
    </article>
  );
}

export function PlatzhalterHinweis({ children, lang }: { children: React.ReactNode; lang: Lang }) {
  return (
    <div className="note note--danger" role="note">
      <h4>{texte(lang).allgemein.platzhalterTitel}</h4>
      <p>{children}</p>
    </div>
  );
}

export function CtaRechner({ lang }: { lang: Lang }) {
  const t = texte(lang).start;
  return (
    <section className="section" aria-labelledby="cta-ende">
      <div className="wrap">
        <div className="cta-band">
          <h2 id="cta-ende">{t.ctaTitel}</h2>
          <p>{t.ctaText}</p>
          <div className="btn-row">
            <Link href={pfad(lang, "/rechner")} className="btn btn--light">{t.cta1} <Icon name="arrow" size={18} /></Link>
            <Link href={pfad(lang, "/wissen")} className="btn btn--ghost-light">{t.ctaZweit}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Deutlicher Einstieg zur persönlichen Beratung – führt zur Partner-Auswahl. */
export function BeratungCta({ lang }: { lang: Lang }) {
  const n = texte(lang).neu;
  return (
    <aside className="beratung" aria-labelledby="beratung-titel">
      <span className="beratung__bild"><Icon name="users" size={40} /></span>
      <div className="stack">
        <p className="eyebrow">{n.beratungEyebrow}</p>
        <h2 id="beratung-titel">{n.beratungTitel}</h2>
        <p>{n.beratungText}</p>
      </div>
      <div className="beratung__aktion">
        <Link href={pfad(lang, "/partner")} className="btn btn--gold">{n.beratungKnopf} <Icon name="arrow" size={18} /></Link>
        <p className="small">{n.beratungKlein}</p>
      </div>
    </aside>
  );
}

export function JsonLd({ daten }: { daten: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Inhalt stammt ausschließlich aus eigener Konfiguration; "<" wird maskiert.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(daten).replace(/</g, "\\u003c") }}
    />
  );
}

export const organisation = { "@type": "Organization", name: site.name, url: site.url };
