import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { istSprache, statischeSprachen, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const generateStaticParams = statischeSprachen;

export default async function OpenGraphBild({ params }: LangParams) {
  const { lang } = await params;
  const t = texte(istSprache(lang) ? lang : "de");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 72, background: "linear-gradient(135deg, #06121d 0%, #0b3b47 100%)", color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40 }}>
          <svg width="60" height="60" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#0f5d5a" />
            <path d="M7 21.5l6.5-6.5 4 4L25 11.5M19.5 11H25v5.5" fill="none" stroke="#7ff5dc" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex" }}>
            {site.name}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 76, lineHeight: 1.08, letterSpacing: -2 }}>{t.hero2.h1a}</div>
          <div style={{ fontSize: 76, lineHeight: 1.08, letterSpacing: -2, color: "#7fdcc4" }}>{t.hero2.h1b}</div>
          <div style={{ fontSize: 32, color: "#c9d5e3", marginTop: 16 }}>{t.meta.claim}</div>
        </div>
      </div>
    ),
    size,
  );
}
