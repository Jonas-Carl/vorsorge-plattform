import Link from "next/link";
import type { Block } from "@/content/typen";
import { pfad, type Lang } from "@/i18n";
import { texte } from "@/i18n/texte";

/** Wandelt **fett** und [Text](/pfad) in React-Elemente um; interne Links erhalten das Sprachpräfix. */
export function Inline({ text, lang }: { text: string; lang: Lang }) {
  const teile = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {teile.map((teil, i) => {
        if (teil.startsWith("**")) return <strong key={i}>{teil.slice(2, -2)}</strong>;
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(teil);
        if (link) {
          const [, label, href] = link;
          return href!.startsWith("/") ? (
            <Link key={i} href={pfad(lang, href!)}>{label}</Link>
          ) : (
            <a key={i} href={href} rel="noopener noreferrer" target="_blank">{label}</a>
          );
        }
        return teil;
      })}
    </>
  );
}

export function ArticleBody({ bloecke, lang }: { bloecke: Block[]; lang: Lang }) {
  const beispielLabel = texte(lang).allgemein.rechenbeispiel;
  return (
    <div className="prose">
      {bloecke.map((b, i) => {
        switch (b.t) {
          case "p":
            return <p key={i}><Inline text={b.x} lang={lang} /></p>;
          case "h2":
            return <h2 key={i}>{b.x}</h2>;
          case "h3":
            return <h3 key={i}>{b.x}</h3>;
          case "ul":
            return <ul key={i}>{b.items.map((item, j) => <li key={j}><Inline text={item} lang={lang} /></li>)}</ul>;
          case "hinweis":
            return (
              <div key={i} className={`note ${b.art === "gold" ? "note--gold" : ""}`}>
                {b.titel && <h4>{b.titel}</h4>}
                <p><Inline text={b.x} lang={lang} /></p>
              </div>
            );
          case "beispiel":
            return (
              <div key={i} className="example">
                <p className="example__label">{beispielLabel}</p>
                <h4>{b.titel}</h4>
                {b.x.map((zeile, j) => <p key={j}><Inline text={zeile} lang={lang} /></p>)}
              </div>
            );
          case "tabelle":
            return (
              <div key={i} className="table-wrap">
                <table>
                  {b.titel && <caption>{b.titel}</caption>}
                  <thead><tr>{b.kopf.map((k, j) => <th key={j} scope="col">{k}</th>)}</tr></thead>
                  <tbody>
                    {b.zeilen.map((zeile, j) => (
                      <tr key={j}>
                        {zeile.map((zelle, k) =>
                          k === 0 ? <th key={k} scope="row"><Inline text={zelle} lang={lang} /></th> : <td key={k}><Inline text={zelle} lang={lang} /></td>,
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
