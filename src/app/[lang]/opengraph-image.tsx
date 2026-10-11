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
          padding: 72, background: "linear-gradient(135deg, #0b1f3a 0%, #0f4c5c 100%)", color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#6fd3bd", display: "flex" }} />
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 88, lineHeight: 1.05, letterSpacing: -2 }}>{t.start.h1a}</div>
          <div style={{ fontSize: 88, lineHeight: 1.05, letterSpacing: -2, color: "#6fd3bd" }}>{t.start.h1b}</div>
          <div style={{ fontSize: 32, color: "#c9d5e3", marginTop: 16 }}>{t.meta.claim}</div>
        </div>
      </div>
    ),
    size,
  );
}
