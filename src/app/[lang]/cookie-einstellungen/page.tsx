import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/Bausteine";
import { ConsentSettings } from "@/components/ConsentSettings";
import { alternativen, istSprache, pfad, type Lang, type LangParams } from "@/i18n";

const T = {
  de: {
    metaTitel: "Cookie-Einstellungen",
    metaText: "Was diese Website in deinem Browser speichert und wie du deine Auswahl änderst.",
    eyebrow: "Rechtliches",
    titel: "Cookie-Einstellungen",
    heroText:
      "Diese Website braucht keine Cookies und kein Tracking. Hier siehst du, was gespeichert wird. Deine Auswahl kannst du jederzeit ändern.",
    krume: "Cookie-Einstellungen",
    hinweisVor:
      "Solange du nichts auswählst, wird nichts gespeichert oder ausgelesen, was nicht nötig ist. Darum zeigen wir kein Einwilligungsbanner. Mehr dazu unter ",
    hinweisLink: "Datenschutz",
  },
  en: {
    metaTitel: "Cookie settings",
    metaText: "What this website stores in your browser and how you change your choice.",
    eyebrow: "Legal",
    titel: "Cookie settings",
    heroText:
      "This website needs no cookies and no tracking. Here you can see what is stored. You can change your choice at any time.",
    krume: "Cookie settings",
    hinweisVor:
      "As long as you do not choose anything, nothing is stored or read that is not necessary. That is why we do not show a consent banner. More under ",
    hinweisLink: "Privacy",
  },
} satisfies Record<Lang, unknown>;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  return {
    title: T[lang].metaTitel,
    description: T[lang].metaText,
    alternates: alternativen(lang, "/cookie-einstellungen"),
  };
}

export default async function CookieSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = T[lang];

  return (
    <>
      <PageHero
        lang={lang}
        eyebrow={t.eyebrow}
        titel={t.titel}
        text={t.heroText}
        krumen={[{ label: t.krume }]}
      />
      <section className="section">
        <div className="wrap" style={{ maxWidth: "48rem" }}>
          <ConsentSettings lang={lang} />
          <p className="small muted" style={{ marginTop: "var(--s-6)" }}>
            {t.hinweisVor}
            <Link href={pfad(lang, "/datenschutz")}>{t.hinweisLink}</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
