"use client";

import { useEffect, useState } from "react";
import { leseEinstellungen, speichereEinstellungen, type Einstellungen } from "@/lib/analytics";
import { datum, type Lang } from "@/lib/format";

const T = {
  de: {
    noetigTitel: "Technisch nötig",
    noetigText:
      "(immer an). Speichert nur deine Auswahl auf dieser Seite – im lokalen Speicher deines Browsers. Es werden keine Cookies gesetzt.",
    statistikTitel: "Statistik",
    statistikVor:
      "(normalerweise aus). Damit dürften wir anonym zählen, welche Seiten und Funktionen genutzt werden.",
    statistikKursiv: "Im Moment ist kein Statistikdienst eingebunden",
    statistikNach:
      "– auch wenn du das einschaltest, werden zurzeit keine Daten erhoben oder verschickt.",
    speichern: "Auswahl speichern",
    nurNoetig: "Nur das Nötige",
    gespeichert: "Deine Auswahl ist gespeichert.",
    zuletzt: (d: string) => `Zuletzt gespeichert am ${d}.`,
    keine: "Du hast noch keine Auswahl gespeichert. Ohne Auswahl bleibt alles aus, was nicht nötig ist.",
  },
  en: {
    noetigTitel: "Technically necessary",
    noetigText:
      "(always on). Stores only your choice on this page – in your browser's local storage. No cookies are set.",
    statistikTitel: "Statistics",
    statistikVor:
      "(normally off). This would allow us to count anonymously which pages and features are used.",
    statistikKursiv: "At the moment no statistics service is built in",
    statistikNach:
      "– even if you switch this on, no data is collected or sent at present.",
    speichern: "Save choice",
    nurNoetig: "Only what is necessary",
    gespeichert: "Your choice has been saved.",
    zuletzt: (d: string) => `Last saved on ${d}.`,
    keine: "You have not saved a choice yet. Without a choice, everything that is not necessary stays off.",
  },
  fr: {
    noetigTitel: "Techniquement nécessaire",
    noetigText:
      "(toujours actif). Enregistre uniquement ton choix sur cette page – dans le stockage local de ton navigateur. Aucun cookie n'est déposé.",
    statistikTitel: "Statistiques",
    statistikVor:
      "(désactivé par défaut). Cela nous permettrait de compter de façon anonyme quelles pages et fonctions sont utilisées.",
    statistikKursiv: "Pour l'instant, aucun service de statistiques n'est intégré",
    statistikNach:
      "– même si tu l'actives, aucune donnée n'est collectée ni envoyée actuellement.",
    speichern: "Enregistrer mon choix",
    nurNoetig: "Seulement le nécessaire",
    gespeichert: "Ton choix est enregistré.",
    zuletzt: (d: string) => `Dernier enregistrement le ${d}.`,
    keine: "Tu n'as pas encore enregistré de choix. Sans choix, tout ce qui n'est pas nécessaire reste désactivé.",
  },
} satisfies Record<Lang, unknown>;

export function ConsentSettings({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [e, setE] = useState<Einstellungen | null>(null);
  const [statistik, setStatistik] = useState(false);
  const [gespeichert, setGespeichert] = useState(false);

  useEffect(() => {
    // Der lokale Speicher ist erst im Browser verfügbar.
    const gelesen = leseEinstellungen();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setE(gelesen);
    setStatistik(gelesen.statistik);
  }, []);

  function speichern(wert: boolean) {
    setStatistik(wert);
    setE(speichereEinstellungen(wert));
    setGespeichert(true);
  }

  return (
    <div className="stack-lg">
      <div className="card card--pad">
        <label className="switch">
          <input type="checkbox" role="switch" checked disabled readOnly />
          <span>
            <strong>{t.noetigTitel}</strong> {t.noetigText}
          </span>
        </label>
      </div>
      <div className="card card--pad">
        <label className="switch">
          <input type="checkbox" role="switch" checked={statistik} onChange={(ev) => setStatistik(ev.target.checked)} />
          <span>
            <strong>{t.statistikTitel}</strong> {t.statistikVor} <em>{t.statistikKursiv}</em> {t.statistikNach}
          </span>
        </label>
      </div>
      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={() => speichern(statistik)}>{t.speichern}</button>
        <button type="button" className="btn btn--ghost" onClick={() => speichern(false)}>{t.nurNoetig}</button>
      </div>
      <p className="small muted" role="status">
        {gespeichert
          ? t.gespeichert
          : e?.entschiedenAm
            ? t.zuletzt(datum(e.entschiedenAm.slice(0, 10), lang))
            : t.keine}
      </p>
    </div>
  );
}
