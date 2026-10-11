"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pfad, type Lang } from "@/i18n";
import { texte } from "@/i18n/texte";

export default function NichtGefunden() {
  const lang: Lang = usePathname().startsWith("/en") ? "en" : "de";
  const t = texte(lang).nichtGefunden;
  return (
    <section className="section">
      <div className="wrap stack" style={{ maxWidth: "40rem" }}>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 style={{ fontSize: "var(--text-3xl)" }}>{t.titel}</h1>
        <p className="lead">{t.text}</p>
        <div className="btn-row">
          <Link href={pfad(lang, "/")} className="btn btn--primary">{t.start}</Link>
          <Link href={pfad(lang, "/wissen")} className="btn btn--ghost">{t.wissen}</Link>
        </div>
      </div>
    </section>
  );
}
