import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, PartnerKarte } from "@/components/Bausteine";
import { partner } from "@/config/partner";
import { alternativen, istSprache, pfad, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  const n = texte(lang).neu;
  return { title: n.partnerTitel, description: n.partnerText, alternates: alternativen(lang, "/partner") };
}

export default async function PartnerSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = texte(lang).partner;
  const n = texte(lang).neu;

  return (
    <>
      <PageHero lang={lang} eyebrow={t.eyebrow} titel={n.partnerTitel} text={n.partnerText} krumen={[{ label: t.eyebrow }]} />

      <section className="section" aria-labelledby="status-titel">
        <div className="wrap stack-lg">
          <div className="note note--gold">
            <h4 id="status-titel">{t.standKeine}</h4>
            <p>{t.standText}</p>
          </div>
          <div className="grid grid--4">
            {partner.map((p, i) => <PartnerKarte key={p.id} p={p} nr={i + 1} lang={lang} auswahl />)}
          </div>
          <aside className="cta-quiet" aria-labelledby="fallback-titel">
            <div className="stack">
              <h2 id="fallback-titel" style={{ fontSize: "var(--text-xl)" }}>{n.fallbackTitel}</h2>
              <p>{n.fallbackText}</p>
            </div>
            <Link href={pfad(lang, "/anfrage")} className="btn btn--primary">{n.fallbackKnopf}</Link>
          </aside>
        </div>
      </section>

      <section className="section section--sand" aria-labelledby="ablauf-titel">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">{t.ablaufEyebrow}</p>
            <h2 id="ablauf-titel">{t.ablaufTitel}</h2>
          </div>
          <ol className="steps steps--4">
            {t.ablauf.map((s) => <li key={s.titel}><h3>{s.titel}</h3><p>{s.text}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="regeln-titel">
        <div className="wrap grid grid--2" style={{ gap: "clamp(2rem, 5vw, 5rem)" }}>
          <div className="stack">
            <h2 id="regeln-titel">{t.regelnTitel}</h2>
            <ul className="haken">{t.regeln.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="stack">
            <h2>{t.nichtTitel}</h2>
            <p>{t.nichtText}</p>
            <p>{t.geldText} <Link href={pfad(lang, "/transparenz")}>{t.geldLink}</Link></p>
            <div className="btn-row">
              <Link href={pfad(lang, "/anfrage")} className="btn btn--primary">{t.frage}</Link>
              <Link href={pfad(lang, "/kontakt")} className="btn btn--ghost">{t.alsPartner}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
