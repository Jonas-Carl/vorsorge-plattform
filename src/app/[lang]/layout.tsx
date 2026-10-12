import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { Attribution } from "@/components/Attribution";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/config/site";
import { alternativen, istSprache, statischeSprachen, type LangParams } from "@/i18n";
import { texte } from "@/i18n/texte";
import { loc } from "@/lib/format";
import "../globals.css";
import "../einfach.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", style: ["normal", "italic"] });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const dynamicParams = false;
export const generateStaticParams = statischeSprachen;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  const t = texte(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: `${site.name} – ${t.meta.claim}`, template: `%s | ${site.name}` },
    description: t.meta.beschreibung,
    applicationName: site.name,
    alternates: alternativen(lang, "/"),
    openGraph: {
      type: "website",
      locale: loc(lang).replace("-", "_"),
      siteName: site.name,
      title: `${site.name} – ${t.meta.claim}`,
      description: t.meta.beschreibung,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = { themeColor: "#0b1f3a", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children, params }: { children: React.ReactNode } & LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = texte(lang);
  return (
    <html lang={lang} className={`${fraunces.variable} ${hanken.variable}`}>
      <body>
        <a href="#inhalt" className="skip">{t.nav.skip}</a>
        <Header lang={lang} />
        <main id="inhalt">{children}</main>
        <Footer lang={lang} />
        <Attribution />
      </body>
    </html>
  );
}
