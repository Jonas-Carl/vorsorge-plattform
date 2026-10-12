import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, PlatzhalterHinweis } from "@/components/Bausteine";
import { site } from "@/config/site";
import { alternativen, istSprache, pfad, type Lang, type LangParams } from "@/i18n";
import { AUFBEWAHRUNG_TAGE } from "@/lib/leads/service";

const T = {
  de: {
    metaTitel: "Datenschutz",
    metaText: "Welche Daten diese Website verarbeitet, wozu und wie lange. Und welche Rechte du hast.",
    eyebrow: "Rechtliches",
    titel: "Datenschutz",
    heroText: "Was diese Website technisch wirklich tut – in einfachen Worten.",
    krume: "Datenschutz",
    platzhalter:
      "Diese Seite beschreibt, was die Anwendung wirklich mit Daten macht. Sie ist aber noch keine vollständige Datenschutzerklärung nach Art. 13 DSGVO (das ist die Regel, was man dir über deine Daten sagen muss). Es fehlen unter anderem: Name und Kontaktdaten des Verantwortlichen, falls nötig Datenschutzbeauftragte, Angaben zum Hosting-Anbieter und zu Auftragsverarbeitern (Firmen, die in unserem Auftrag Daten verarbeiten) sowie die rechtlich geprüften Rechtsgrundlagen. Vor dem Livegang muss eine Fachperson das prüfen.",
    verantwortlichTitel: "Wer verantwortlich ist",
    aufrufTitel: "Wenn du die Website aufrufst",
    aufruf:
      "Wenn du die Seite aufrufst, verarbeitet der Webserver Verbindungsdaten, die technisch nötig sind. Zum Beispiel: IP-Adresse, Zeitpunkt und welche Seite du abrufst. Was genau protokolliert wird und wie lange, hängt vom Hosting ab: ",
    schriften:
      "Die Schriften kommen von unserem eigenen Server. Es werden keine Schriftdateien von anderen Firmen nachgeladen. Es sind keine fremden Inhalte, Karten oder Videos eingebunden.",
    rechnerTitel: "Rechner",
    rechner:
      "Der Rechner rechnet komplett in deinem Browser. Was du eingibst, wird nicht an unseren Server geschickt. Es wird nicht gespeichert. Und es wird nicht mit einer Anfrage verknüpft.",
    cookiesTitel: "Cookies und Speicher im Browser",
    cookiesVor:
      "Wir setzen keine Cookies. Im lokalen Speicher deines Browsers legen wir nur eine Sache ab: deine Auswahl in den ",
    cookiesLink: "Cookie-Einstellungen",
    cookiesNach:
      " – und erst dann, wenn du dort etwas speicherst. Das ist technisch nötig, damit wir uns an deine Entscheidung halten können.",
    messungTitel: "Besucher zählen und Werbung",
    messung:
      "Im Moment ist kein Analysedienst und kein Werbedienst eingebunden. Es gehen keine Daten an soziale Netzwerke oder Werbeplattformen. Falls wir später einmal zählen wollen, wie die Seite genutzt wird (Reichweitenmessung), dann nur mit deiner Einwilligung. Und es wird dann hier beschrieben.",
    anfrageTitel: "Wenn du eine Anfrage schickst",
    zeilen: {
      welche: ["Welche Daten", "Vorname, Nachname, E-Mail-Adresse, gewählter Kontaktweg, dein Anliegen. Freiwillig: Telefonnummer, bevorzugte Zeit und Nachricht. Dazu: der Zeitpunkt, der gewählte Empfänger und der genaue Wortlaut deiner Bestätigung."],
      nicht: ["Was wir nicht speichern", "IP-Adresse und Browserkennung im Datensatz der Anfrage, deine Eingaben im Rechner, Daten zu Einkommen oder Gesundheit."],
      zweck: ["Wozu", "Um deine Anfrage zu beantworten. Wenn du einen Partner gewählt hast: um sie an genau diesen Partner weiterzugeben, damit er sich bei dir meldet."],
      grundlage: ["Rechtsgrundlage (was es erlaubt)", "Geplant ist: Wir bearbeiten die Daten, weil du uns anfragst (Art. 6 Abs. 1 lit. b DSGVO). Die Weitergabe an den gewählten Partner erfolgt mit deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)."],
      empfaengerTitel: "Wer die Daten bekommt",
      empfaenger: (n: string) => `Nur der Empfänger, den du im Formular gewählt hast und der dir vor dem Absenden angezeigt wird. Im Moment ist das nur ${n}. Es gibt noch keine Partner.`,
      kampagne: ["Zuordnung zu einer Kampagne", "Bist du über einen Kampagnenlink gekommen? Dann speichern wir mit der Anfrage die allgemeinen Kampagnenangaben (Quelle, Medium, Kampagnenname) und den Pfad der Seite, auf der du eingestiegen bist. Wir speichern keine Klick-IDs und keine Nutzerkennung."],
      dauerTitel: "Wie lange",
      dauer: (tage: number) => `Geplant ist: Wir löschen spätestens ${tage} Tage nach dem Eingang – außer ein Gesetz schreibt vor, dass wir etwas länger aufbewahren müssen.`,
      schutz: ["Schutz vor Missbrauch", "Ein unsichtbares Formularfeld und eine Zeitprüfung halten automatische Einsendungen ab. Außerdem begrenzen wir, wie viele Anfragen von derselben Herkunft kommen dürfen. Dafür wird die IP-Adresse kurz verarbeitet – nur im Arbeitsspeicher und nur als Wert, aus dem man die Adresse nicht zurückrechnen kann."],
    },
    rechteTitel: "Deine Rechte",
    rechte:
      "Du hast diese Rechte: Auskunft (du darfst fragen, was wir über dich gespeichert haben), Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit (du kannst deine Daten mitnehmen) und Widerspruch. Eine Einwilligung kannst du jederzeit widerrufen. Das gilt dann für die Zukunft. Außerdem kannst du dich bei einer Datenschutzaufsichtsbehörde beschweren.",
    kontakt: "Kontakt für Fragen zum Datenschutz: ",
  },
  en: {
    metaTitel: "Privacy",
    metaText: "Which data this website processes, why and for how long. And which rights you have.",
    eyebrow: "Legal",
    titel: "Privacy",
    heroText: "What this website really does on the technical side – in plain words.",
    krume: "Privacy",
    platzhalter:
      "This page describes what the application really does with data. But it is not yet a complete privacy notice under Art. 13 GDPR (DSGVO) – the rule on what you must be told about your data. Among other things, these are missing: the name and contact details of the controller, a data protection officer if one is needed, details of the hosting provider and of processors (companies that process data on our behalf), and the legally checked legal bases. Before the site goes live, an expert must review this.",
    verantwortlichTitel: "Who is responsible",
    aufrufTitel: "When you open the website",
    aufruf:
      "When you open the site, the web server processes connection data that is technically necessary. For example: IP address, time and which page you request. What exactly is logged and for how long depends on the hosting: ",
    schriften:
      "The fonts come from our own server. No font files are loaded from other companies. No outside content, maps or videos are embedded.",
    rechnerTitel: "Calculator",
    rechner:
      "The calculator runs completely in your browser. What you type in is not sent to our server. It is not stored. And it is not linked to a request.",
    cookiesTitel: "Cookies and storage in the browser",
    cookiesVor:
      "We do not set any cookies. In your browser's local storage we keep only one thing: your choice in the ",
    cookiesLink: "cookie settings",
    cookiesNach:
      " – and only once you save something there. This is technically necessary so that we can respect your decision.",
    messungTitel: "Counting visitors and advertising",
    messung:
      "At the moment, no analytics service and no advertising service is built in. No data goes to social networks or advertising platforms. If we ever want to count how the site is used (audience measurement), this will only happen with your consent. And it will then be described here.",
    anfrageTitel: "When you send a request",
    zeilen: {
      welche: ["Which data", "First name, last name, email address, chosen way of contact, what your request is about. Optional: phone number, preferred time and message. Also: the time, the chosen recipient and the exact wording of your confirmation."],
      nicht: ["What we do not store", "IP address and browser identifier in the request record, what you typed into the calculator, data about income or health."],
      zweck: ["What for", "To answer your request. If you chose a partner: to pass it on to exactly that partner so that they can get in touch with you."],
      grundlage: ["Legal basis (what allows it)", "Planned: we process the data because you send us a request (Art. 6 Abs. 1 lit. b DSGVO). Passing it on to the chosen partner happens with your consent (Art. 6 Abs. 1 lit. a DSGVO)."],
      empfaengerTitel: "Who gets the data",
      empfaenger: (n: string) => `Only the recipient you chose in the form, who is shown to you before you send it. At the moment this is only ${n}. There are no partners yet.`,
      kampagne: ["Link to a campaign", "Did you arrive through a campaign link? Then we store, together with the request, the general campaign details (source, medium, campaign name) and the path of the page where you entered. We do not store click IDs or any user identifier."],
      dauerTitel: "How long",
      dauer: (tage: number) => `Planned: we delete at the latest ${tage} days after receipt – unless a law requires us to keep something longer.`,
      schutz: ["Protection against misuse", "An invisible form field and a timing check keep automated submissions out. We also limit how many requests may come from the same origin. For this, the IP address is processed briefly – only in working memory and only as a value from which the address cannot be worked out again."],
    },
    rechteTitel: "Your rights",
    rechte:
      "You have these rights: access (you may ask what we have stored about you), correction, deletion, restriction of processing, data portability (you can take your data with you) and objection. You can withdraw consent at any time. This then applies for the future. You can also complain to a data protection supervisory authority.",
    kontakt: "Contact for privacy questions: ",
  },
  fr: {
    metaTitel: "Protection des données",
    metaText: "Quelles données ce site traite, pourquoi et pendant combien de temps. Et quels sont tes droits.",
    eyebrow: "Mentions",
    titel: "Protection des données",
    heroText: "Ce que ce site fait vraiment sur le plan technique – avec des mots simples.",
    krume: "Protection des données",
    platzhalter:
      "Cette page décrit ce que l'application fait vraiment avec les données. Mais ce n'est pas encore une déclaration de protection des données complète selon l'art. 13 du RGPD (DSGVO) – la règle sur ce que l'on doit te dire à propos de tes données. Il manque entre autres : le nom et les coordonnées du responsable, un délégué à la protection des données si nécessaire, des informations sur l'hébergeur et sur les sous-traitants (des entreprises qui traitent des données pour notre compte) ainsi que les bases juridiques vérifiées. Avant la mise en ligne, un spécialiste doit vérifier cela.",
    verantwortlichTitel: "Qui est responsable",
    aufrufTitel: "Quand tu ouvres le site",
    aufruf:
      "Quand tu ouvres le site, le serveur web traite des données de connexion techniquement nécessaires. Par exemple : l'adresse IP, le moment et la page que tu demandes. Ce qui est exactement enregistré, et pendant combien de temps, dépend de l'hébergement : ",
    schriften:
      "Les polices viennent de notre propre serveur. Aucun fichier de police n'est chargé depuis d'autres entreprises. Aucun contenu externe, aucune carte ni vidéo ne sont intégrés.",
    rechnerTitel: "Simulateur",
    rechner:
      "Le simulateur calcule entièrement dans ton navigateur. Ce que tu saisis n'est pas envoyé à notre serveur. Ce n'est pas enregistré. Et ce n'est pas relié à une demande.",
    cookiesTitel: "Cookies et stockage dans le navigateur",
    cookiesVor:
      "Nous ne déposons pas de cookies. Dans le stockage local de ton navigateur, nous ne gardons qu'une chose : ton choix dans les ",
    cookiesLink: "réglages des cookies",
    cookiesNach:
      " – et seulement quand tu y enregistres quelque chose. C'est techniquement nécessaire pour que nous puissions respecter ta décision.",
    messungTitel: "Compter les visiteurs et publicité",
    messung:
      "Pour l'instant, aucun service d'analyse ni aucun service publicitaire n'est intégré. Aucune donnée ne part vers des réseaux sociaux ou des plateformes publicitaires. Si nous voulons un jour compter comment le site est utilisé (mesure d'audience), ce sera seulement avec ton accord. Et ce sera alors décrit ici.",
    anfrageTitel: "Quand tu envoies une demande",
    zeilen: {
      welche: ["Quelles données", "Prénom, nom, adresse e-mail, moyen de contact choisi, ton sujet. Facultatif : numéro de téléphone, moment souhaité et message. En plus : la date et l'heure, le destinataire choisi et le texte exact de ta confirmation."],
      nicht: ["Ce que nous n'enregistrons pas", "L'adresse IP et l'identifiant du navigateur dans la fiche de la demande, tes saisies dans le simulateur, des données sur le revenu ou la santé."],
      zweck: ["Pour quoi faire", "Pour répondre à ta demande. Si tu as choisi un partenaire : pour la transmettre à ce partenaire précis, afin qu'il te contacte."],
      grundlage: ["Base juridique (ce qui l'autorise)", "Il est prévu ceci : nous traitons les données parce que tu nous envoies une demande (Art. 6 Abs. 1 lit. b DSGVO). La transmission au partenaire choisi se fait avec ton consentement (Art. 6 Abs. 1 lit. a DSGVO)."],
      empfaengerTitel: "Qui reçoit les données",
      empfaenger: (n: string) => `Seulement le destinataire que tu as choisi dans le formulaire et qui t'est affiché avant l'envoi. Pour l'instant, c'est seulement ${n}. Il n'y a pas encore de partenaires.`,
      kampagne: ["Lien avec une campagne", "Tu es arrivé par un lien de campagne ? Alors nous enregistrons avec la demande les informations générales de la campagne (source, support, nom de la campagne) et le chemin de la page par laquelle tu es entré. Nous n'enregistrons ni identifiants de clic ni identifiant d'utilisateur."],
      dauerTitel: "Pendant combien de temps",
      dauer: (tage: number) => `Il est prévu ceci : nous supprimons au plus tard ${tage} jours après la réception – sauf si une loi nous oblige à conserver quelque chose plus longtemps.`,
      schutz: ["Protection contre les abus", "Un champ de formulaire invisible et un contrôle du temps écartent les envois automatiques. Nous limitons aussi le nombre de demandes qui peuvent venir de la même origine. Pour cela, l'adresse IP est traitée brièvement – seulement en mémoire vive et seulement sous la forme d'une valeur à partir de laquelle on ne peut pas retrouver l'adresse."],
    },
    rechteTitel: "Tes droits",
    rechte:
      "Tu as ces droits : accès (tu peux demander ce que nous avons enregistré sur toi), rectification, suppression, limitation du traitement, portabilité des données (tu peux emporter tes données) et opposition. Tu peux retirer un consentement à tout moment. Cela vaut alors pour l'avenir. Tu peux aussi déposer une réclamation auprès d'une autorité de protection des données.",
    kontakt: "Contact pour les questions sur la protection des données : ",
  },
} satisfies Record<Lang, unknown>;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!istSprache(lang)) return {};
  return {
    title: T[lang].metaTitel,
    description: T[lang].metaText,
    alternates: alternativen(lang, "/datenschutz"),
  };
}

export default async function DatenschutzSeite({ params }: LangParams) {
  const { lang } = await params;
  if (!istSprache(lang)) notFound();
  const t = T[lang];
  const z = t.zeilen;

  return (
    <>
      <PageHero
        lang={lang}
        eyebrow={t.eyebrow}
        titel={t.titel}
        text={t.heroText}
        krumen={[{ label: t.krume }]}
        stand={site.inhaltsstand}
      />
      <section className="section">
        <div className="wrap prose">
          <PlatzhalterHinweis lang={lang}>{t.platzhalter}</PlatzhalterHinweis>

          <h2>{t.verantwortlichTitel}</h2>
          <p><span className="ph">[VERANTWORTLICHER_NAME_ANSCHRIFT_KONTAKT]</span> · <span className="ph">[DATENSCHUTZKONTAKT]</span></p>

          <h2>{t.aufrufTitel}</h2>
          <p>{t.aufruf}<span className="ph">[HOSTING_ANBIETER_UND_LOGDAUER]</span>.</p>
          <p>{t.schriften}</p>

          <h2>{t.rechnerTitel}</h2>
          <p>{t.rechner}</p>

          <h2>{t.cookiesTitel}</h2>
          <p>
            {t.cookiesVor}
            <Link href={pfad(lang, "/cookie-einstellungen")}>{t.cookiesLink}</Link>
            {t.cookiesNach}
          </p>

          <h2>{t.messungTitel}</h2>
          <p>{t.messung}</p>

          <h2>{t.anfrageTitel}</h2>
          <div className="table-wrap">
            <table>
              <tbody>
                <tr><th scope="row">{z.welche[0]}</th><td>{z.welche[1]}</td></tr>
                <tr><th scope="row">{z.nicht[0]}</th><td>{z.nicht[1]}</td></tr>
                <tr><th scope="row">{z.zweck[0]}</th><td>{z.zweck[1]}</td></tr>
                <tr><th scope="row">{z.grundlage[0]}</th><td>{z.grundlage[1]} <span className="ph">[RECHTLICH_ZU_PRUEFEN]</span></td></tr>
                <tr><th scope="row">{z.empfaengerTitel}</th><td>{z.empfaenger(site.name)}</td></tr>
                <tr><th scope="row">{z.kampagne[0]}</th><td>{z.kampagne[1]}</td></tr>
                <tr><th scope="row">{z.dauerTitel}</th><td>{z.dauer(AUFBEWAHRUNG_TAGE)} <span className="ph">[LOESCHKONZEPT_ZU_PRUEFEN]</span></td></tr>
                <tr><th scope="row">{z.schutz[0]}</th><td>{z.schutz[1]}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>{t.rechteTitel}</h2>
          <p>{t.rechte}</p>
          <p>{t.kontakt}<span className="ph">[DATENSCHUTZKONTAKT]</span></p>
        </div>
      </section>
    </>
  );
}
