"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { pfad, sprachen, sprachName, wechslePfad, type Lang } from "@/i18n";
import { texte } from "@/i18n/texte";
import { Icon, LogoMark } from "./Icon";

export function Header({ lang }: { lang: Lang }) {
  const aktuell = usePathname();
  const [offen, setOffen] = useState(false);
  const t = texte(lang).nav;

  // Menü mit Escape schließen.
  useEffect(() => {
    if (!offen) return;
    const aufTaste = (e: KeyboardEvent) => e.key === "Escape" && setOffen(false);
    window.addEventListener("keydown", aufTaste);
    return () => window.removeEventListener("keydown", aufTaste);
  }, [offen]);

  const punkte = [
    { href: "/rechner", label: t.rechner },
    { href: "/reform-2027", label: t.reform },
    { href: "/wissen", label: t.wissen },
    { href: "/partner", label: t.partner },
    { href: "/ueber-uns", label: t.ueber },
  ].map((p) => ({ ...p, href: pfad(lang, p.href) }));

  const aktiv = (href: string) => (aktuell === href || aktuell.startsWith(`${href}/`) ? "page" : undefined);

  return (
    <header className="header">
      <div className="wrap header__in">
        <Link href={pfad(lang, "/")} className="logo" aria-label={`${site.name} – ${t.start}`}>
          <LogoMark />
          <span className="logo__name">{site.name}</span>
        </Link>

        <nav className="nav" aria-label={t.haupt}>
          <ul>
            {punkte.map((n) => (
              <li key={n.href}><Link href={n.href} aria-current={aktiv(n.href)}>{n.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div className="header__right">
          <div className="lang" role="group" aria-label={t.sprache}>
            {sprachen.map((s) => (
              <Link
                key={s}
                href={wechslePfad(aktuell, s)}
                hrefLang={s}
                lang={s}
                aria-current={s === lang ? "true" : undefined}
                aria-label={sprachName[s]}
                onClick={() => setOffen(false)}
              >
                {s.toUpperCase()}
              </Link>
            ))}
          </div>
          <Link href={pfad(lang, "/rechner")} className="btn btn--primary header__cta">{t.cta}</Link>
          <button type="button" className="menu-btn" aria-expanded={offen} aria-controls="mobile-nav" onClick={() => setOffen((o) => !o)}>
            <Icon name={offen ? "close" : "menu"} size={18} />
            {t.menue}
          </button>
        </div>
      </div>

      {offen && (
        <nav id="mobile-nav" className="mobile-nav wrap" aria-label={t.haupt}>
          <ul>
            {punkte.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={aktiv(n.href)} onClick={() => setOffen(false)}>{n.label}</Link>
              </li>
            ))}
          </ul>
          <Link href={pfad(lang, "/rechner")} className="btn btn--primary" onClick={() => setOffen(false)}>{t.cta}</Link>
        </nav>
      )}
    </header>
  );
}
