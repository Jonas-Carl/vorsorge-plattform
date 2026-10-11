import Link from "next/link";
import { site } from "@/config/site";
import { pfad, type Lang } from "@/i18n";
import { texte } from "@/i18n/texte";
import { datum } from "@/lib/format";
import { LogoMark } from "./Icon";

export function Footer({ lang }: { lang: Lang }) {
  const t = texte(lang);
  const l = t.footer.links;
  const spalten = [
    { titel: t.footer.spalten.seite, links: [["/rechner", l.rechner], ["/reform-2027", l.reform], ["/wissen", l.wissen], ["/partner", l.partner], ["/anfrage", l.anfrage]] },
    { titel: t.footer.spalten.offen, links: [["/quellen-methodik", l.quellen], ["/transparenz", l.transparenz], ["/ueber-uns", l.ueber], ["/kontakt", l.kontakt]] },
    { titel: t.footer.spalten.recht, links: [["/impressum", l.impressum], ["/datenschutz", l.datenschutz], ["/cookie-einstellungen", l.cookies]] },
  ] as const;

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div className="stack">
            <Link href={pfad(lang, "/")} className="logo" aria-label={`${site.name} – ${t.nav.start}`}>
              <LogoMark />
              <span className="logo__name">{site.name}</span>
            </Link>
            <p style={{ maxWidth: "24rem" }}>{t.footer.text}</p>
          </div>
          {spalten.map((s) => (
            <nav key={s.titel} aria-label={s.titel}>
              <h2>{s.titel}</h2>
              <ul>
                {s.links.map(([href, label]) => (
                  <li key={href}><Link href={pfad(lang, href)}>{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer__legal">
          <p>{t.footer.recht1(site.name)}</p>
          <p>{t.footer.recht2}</p>
          <p>{t.footer.stand}: {datum(site.inhaltsstand, lang)} · © {site.inhaltsstand.slice(0, 4)} {site.name}</p>
        </div>
      </div>
    </footer>
  );
}
