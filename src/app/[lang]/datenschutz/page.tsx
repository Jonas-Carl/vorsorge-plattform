import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/Bausteine";
import { site } from "@/config/site";
import { alternativen, istSprache, pfad, type Lang, type LangParams } from "@/i18n";
import { AUFBEWAHRUNG_TAGE } from "@/lib/leads/service";

const B = site.betreiber;
const H = site.hosting;
/** Fassung ohne Server: Das Formular öffnet das E-Mail-Programm statt Daten an uns zu schicken. */
const PER_EMAIL = process.env.NEXT_PUBLIC_ANFRAGE_PER_EMAIL === "1";
/** Versand über das Skript auf dem Webspace (hosting/anfrage.php) direkt an unser Postfach. */
const PER_SKRIPT = Boolean(process.env.NEXT_PUBLIC_ANFRAGE_ZIEL);

const T = {
  de: {
    metaTitel: "Datenschutz",
    metaText: "Welche Daten diese Website verarbeitet, wozu und wie lange. Und welche Rechte du hast.",
    eyebrow: "Rechtliches",
    titel: "Datenschutz",
    heroText: "Was diese Website mit deinen Daten macht – in einfachen Worten.",
    krume: "Datenschutz",
    verantwortlichTitel: "Wer verantwortlich ist",
    verantwortlichVor: "Verantwortlich für die Datenverarbeitung auf dieser Website ist:",
    vertreten: `vertreten durch die Gesellschafter ${B.vertreten}`,
    telefonLabel: "Telefon",
    emailLabel: "E-Mail",
    dsb: "Einen Datenschutzbeauftragten haben wir nicht benannt, weil wir dazu gesetzlich nicht verpflichtet sind. Bei Fragen zum Datenschutz schreib uns einfach an die E-Mail-Adresse oben.",
    hostingTitel: "Wenn du die Website aufrufst (Hosting)",
    hosting: `Diese Website liegt bei ${H.name} (${H.firma}, ${H.anschrift}). Wenn du die Seite aufrufst, verarbeitet der Server Daten, die dafür technisch nötig sind: deine IP-Adresse, Datum und Uhrzeit, die aufgerufene Seite, die Seite, von der du kommst, sowie Browser und Betriebssystem. Das dient dem sicheren und stabilen Betrieb der Website. Rechtsgrundlage ist unser berechtigtes Interesse daran (Art. 6 Abs. 1 lit. f DSGVO). ${H.name} verarbeitet diese Daten in unserem Auftrag (Art. 28 DSGVO) und darf sie nicht für eigene Zwecke nutzen. Die Daten werden gelöscht, sobald sie für diesen Zweck nicht mehr gebraucht werden.`,
    schriften: "Die Schriften kommen von unserem eigenen Server. Es werden keine Schriftdateien von anderen Firmen nachgeladen. Es sind keine fremden Inhalte, Karten oder Videos eingebunden.",
    rechnerTitel: "Rechner",
    rechner: "Der Rechner rechnet komplett in deinem Browser. Was du eingibst, wird nicht an unseren Server geschickt und nicht gespeichert. Klickst du im Ergebnis auf „Berater anfragen“, legen wir die Werte nur in deinem Browser für das Formular bereit. Übertragen werden sie erst, wenn du das Formular abschickst – und nur, wenn du sie dort nicht entfernst.",
    cookiesTitel: "Cookies und Speicher im Browser",
    cookiesVor: "Wir setzen keine Cookies. Im lokalen Speicher deines Browsers legen wir nur eine Sache ab: deine Auswahl in den ",
    cookiesLink: "Cookie-Einstellungen",
    cookiesNach: " – und erst dann, wenn du dort etwas speicherst. Das ist technisch nötig, damit wir uns an deine Entscheidung halten können (§ 25 Abs. 2 Nr. 2 TDDDG).",
    messungTitel: "Besucher zählen und Werbung",
    messung: "Es ist kein Analysedienst und kein Werbedienst eingebunden. Es gehen keine Daten an soziale Netzwerke oder Werbeplattformen. Falls wir später einmal zählen wollen, wie die Seite genutzt wird, dann nur mit deiner Einwilligung – und es wird dann hier beschrieben.",
    emailTitel: "Wenn du uns eine E-Mail schreibst",
    email: (tage: number) => `Dann verarbeiten wir deine E-Mail-Adresse und den Inhalt deiner Nachricht, um dir zu antworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, wenn es um eine Anfrage zu unserem Angebot geht, sonst unser berechtigtes Interesse, Nachrichten zu beantworten (Art. 6 Abs. 1 lit. f DSGVO). Unser E-Mail-Postfach liegt ebenfalls bei ${H.name}, das die Nachrichten in unserem Auftrag speichert. Wir löschen die Nachricht, wenn deine Frage erledigt ist, spätestens nach ${tage} Tagen – außer ein Gesetz verlangt, dass wir sie länger aufbewahren.`,
    anfrageTitel: "Wenn du eine Anfrage über das Formular schickst",
    zeilen: {
      welche: ["Welche Daten", "Name, Telefonnummer, E-Mail-Adresse und Postleitzahl sowie dein Anliegen und dein Beruf. Freiwillig: eine Nachricht. Kommst du aus dem Rechner, zeigen wir dir dessen Werte im Formular (Alter, Monatsbetrag, Kinder, Rentenalter, Zuschuss, voraussichtliches Ergebnis) – mitgeschickt werden sie nur, wenn du sie dort stehen lässt. Dazu: der Zeitpunkt und der genaue Wortlaut deiner Einwilligung."],
      nicht: ["Was wir nicht speichern", "IP-Adresse und Browserkennung im Datensatz der Anfrage, Daten zu Gesundheit, Kontonummern und genaue Einkommensbeträge."],
      zweck: ["Wozu", "Um deine Anfrage an einen passenden Berater in deiner Nähe weiterzugeben, damit er sich bei dir meldet. Die Postleitzahl nutzen wir, um jemanden in deiner Nähe zu finden."],
      grundlage: ["Rechtsgrundlage", "Deine Einwilligung im Formular (Art. 6 Abs. 1 lit. a DSGVO) und deine Anfrage (Art. 6 Abs. 1 lit. b DSGVO). Die Einwilligung gilt für die Weitergabe an einen Berater aus unserer veröffentlichten Partnerliste und für dessen Kontakt per Telefon oder E-Mail. Du kannst sie jederzeit widerrufen – eine kurze E-Mail genügt."],
      empfaengerTitel: "Wer die Daten bekommt",
      empfaenger: (n: string) => `${n} und ein passender Berater aus unserer Partnerliste (siehe Seite „Beratung“), an den wir deine Angaben aus dem Formular weitergeben. Per E-Mail sagen wir dir, wer es ist. Der Berater verarbeitet deine Daten danach in eigener Verantwortung, um sich bei dir zu melden, und muss dich selbst über seinen Datenschutz informieren. Für den weitergegebenen Kontakt kann uns der Berater bezahlen. Technisch werden die Daten bei unserem Hosting- und E-Mail-Anbieter verarbeitet (siehe oben).`,
      kampagne: ["Zuordnung zu einer Kampagne", "Bist du über einen Kampagnenlink gekommen? Dann speichern wir mit der Anfrage die allgemeinen Kampagnenangaben (Quelle, Medium, Kampagnenname) und den Pfad der Seite, auf der du eingestiegen bist. Wir speichern keine Klick-IDs und keine Nutzerkennung."],
      dauerTitel: "Wie lange",
      dauer: (tage: number) => `Wir löschen deine Anfrage spätestens ${tage} Tage nach dem Eingang – außer ein Gesetz schreibt vor, dass wir etwas länger aufbewahren müssen.`,
      schutz: PER_SKRIPT
        ? ["So wird die Anfrage verschickt", `Wenn du auf Absenden drückst, schickt ein kleines Programm auf unserem Webspace bei ${H.name} deine Angaben als E-Mail an ${B.email}. Dabei wird nichts in einer Datenbank gespeichert. Gegen Missbrauch prüfen wir ein unsichtbares Formularfeld und die Ausfülldauer und begrenzen, wie viele Anfragen in einer Stunde von derselben Herkunft kommen dürfen. Dafür wird die IP-Adresse kurz und nur als nicht zurückrechenbarer Wert verarbeitet (Art. 6 Abs. 1 lit. f DSGVO).`]
        : PER_EMAIL
        ? ["So wird die Anfrage verschickt", `Das Formular schickt nichts an unseren Server. Wenn du auf Absenden drückst, öffnet sich dein eigenes E-Mail-Programm mit einer fertigen Nachricht an ${B.email}. Erst wenn du dort auf Senden drückst, kommt die Anfrage bei uns an. Für diese E-Mail gilt dann auch der Abschnitt zu E-Mails oben.`]
        : ["Schutz vor Missbrauch", "Ein unsichtbares Formularfeld und eine Zeitprüfung halten automatische Einsendungen ab. Außerdem begrenzen wir, wie viele Anfragen von derselben Herkunft kommen dürfen. Dafür wird die IP-Adresse kurz verarbeitet – nur im Arbeitsspeicher und nur als Wert, aus dem man die Adresse nicht zurückrechnen kann (Art. 6 Abs. 1 lit. f DSGVO)."],
    },
    rechteTitel: "Deine Rechte",
    rechte: [
      "Auskunft: Du darfst fragen, welche Daten wir über dich gespeichert haben (Art. 15 DSGVO).",
      "Berichtigung falscher Daten (Art. 16 DSGVO).",
      "Löschung deiner Daten (Art. 17 DSGVO).",
      "Einschränkung der Verarbeitung (Art. 18 DSGVO).",
      "Datenübertragbarkeit: Du kannst deine Daten mitnehmen (Art. 20 DSGVO).",
      "Widerspruch gegen Verarbeitungen, die auf unserem berechtigten Interesse beruhen (Art. 21 DSGVO).",
      "Widerruf einer Einwilligung – jederzeit, mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).",
    ],
    beschwerde: "Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO). Für uns zuständig ist: Die Landesbeauftragte für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hannover.",
    kontakt: "Für alle Fragen zum Datenschutz und um deine Rechte zu nutzen, schreib uns an ",
  },
  en: {
    metaTitel: "Privacy",
    metaText: "Which data this website processes, why and for how long. And which rights you have.",
    eyebrow: "Legal",
    titel: "Privacy",
    heroText: "What this website does with your data – in plain words.",
    krume: "Privacy",
    verantwortlichTitel: "Who is responsible",
    verantwortlichVor: "The controller responsible for data processing on this website is:",
    vertreten: `represented by the partners ${B.vertreten.replace(" und ", " and ")}`,
    telefonLabel: "Phone",
    emailLabel: "Email",
    dsb: "We have not appointed a data protection officer because we are not legally required to. If you have questions about privacy, simply write to the email address above.",
    hostingTitel: "When you open the website (hosting)",
    hosting: `This website is hosted by ${H.name} (${H.firma}, 61 Lordou Vironos Street, 6023 Larnaca, Cyprus). When you open the site, the server processes data that is technically necessary for this: your IP address, date and time, the page you request, the page you came from, and your browser and operating system. This serves the secure and stable operation of the website. The legal basis is our legitimate interest in this (Art. 6(1)(f) GDPR). ${H.name} processes this data on our behalf (Art. 28 GDPR) and may not use it for its own purposes. The data is deleted as soon as it is no longer needed for this purpose.`,
    schriften: "The fonts come from our own server. No font files are loaded from other companies. No outside content, maps or videos are embedded.",
    rechnerTitel: "Calculator",
    rechner: "The calculator runs completely in your browser. What you type in is not sent to our server and not stored. If you click “request an adviser” in the result, we keep the values in your browser only, for the form. They are only transmitted when you send the form – and only if you do not remove them there.",
    cookiesTitel: "Cookies and storage in the browser",
    cookiesVor: "We do not set any cookies. In your browser's local storage we keep only one thing: your choice in the ",
    cookiesLink: "cookie settings",
    cookiesNach: " – and only once you save something there. This is technically necessary so that we can respect your decision (§ 25(2) no. 2 TDDDG).",
    messungTitel: "Counting visitors and advertising",
    messung: "No analytics service and no advertising service is built in. No data goes to social networks or advertising platforms. If we ever want to count how the site is used, this will only happen with your consent – and it will then be described here.",
    emailTitel: "When you send us an email",
    email: (tage: number) => `We process your email address and the content of your message in order to reply. The legal basis is Art. 6(1)(b) GDPR if it concerns a request about our service, otherwise our legitimate interest in answering messages (Art. 6(1)(f) GDPR). Our mailbox is also hosted by ${H.name}, which stores the messages on our behalf. We delete the message once your question has been dealt with, at the latest after ${tage} days – unless a law requires us to keep it longer.`,
    anfrageTitel: "When you send a request through the form",
    zeilen: {
      welche: ["Which data", "Name, phone number, email address and postcode, as well as your request and occupation. Optional: a message. If you come from the calculator, we show you its values in the form (age, monthly amount, children, retirement age, top-up, expected result) – they are only sent if you leave them there. Also: the time and the exact wording of your consent."],
      nicht: ["What we do not store", "IP address and browser identifier in the request record, health data, account numbers and exact income figures."],
      zweck: ["What for", "To pass your request on to a suitable adviser near you so that they can get in touch with you. We use the postcode to find someone near you."],
      grundlage: ["Legal basis", "Your consent in the form (Art. 6(1)(a) GDPR) and your request (Art. 6(1)(b) GDPR). The consent covers passing your details on to an adviser from our published partner list and their contacting you by phone or email. You can withdraw it at any time – a short email is enough."],
      empfaengerTitel: "Who gets the data",
      empfaenger: (n: string) => `${n} and a suitable adviser from our partner list (see the “Advice” page), to whom we pass on the details from the form. We tell you by email who it is. The adviser then processes your data under their own responsibility in order to contact you, and must inform you about their own data protection. The adviser may pay us for the contact passed on. Technically, the data is processed by our hosting and email provider (see above).`,
      kampagne: ["Link to a campaign", "Did you arrive through a campaign link? Then we store, together with the request, the general campaign details (source, medium, campaign name) and the path of the page where you entered. We do not store click IDs or any user identifier."],
      dauerTitel: "How long",
      dauer: (tage: number) => `We delete your request at the latest ${tage} days after receipt – unless a law requires us to keep something longer.`,
      schutz: PER_SKRIPT
        ? ["How the request is sent", `When you press send, a small program on our web space at ${H.name} sends your details as an email to ${B.email}. Nothing is stored in a database. To prevent misuse, we check an invisible form field and the time taken to fill in the form, and limit how many requests may come from the same origin within an hour. For this, the IP address is processed briefly and only as a value that cannot be worked back (Art. 6(1)(f) GDPR).`]
        : PER_EMAIL
        ? ["How the request is sent", `The form does not send anything to our server. When you press send, your own email program opens with a ready-made message to ${B.email}. The request only reaches us once you press send there. The section on emails above then also applies to this email.`]
        : ["Protection against misuse", "An invisible form field and a timing check keep automated submissions out. We also limit how many requests may come from the same origin. For this, the IP address is processed briefly – only in working memory and only as a value from which the address cannot be worked out again (Art. 6(1)(f) GDPR)."],
    },
    rechteTitel: "Your rights",
    rechte: [
      "Access: you may ask which data we have stored about you (Art. 15 GDPR).",
      "Correction of incorrect data (Art. 16 GDPR).",
      "Deletion of your data (Art. 17 GDPR).",
      "Restriction of processing (Art. 18 GDPR).",
      "Data portability: you can take your data with you (Art. 20 GDPR).",
      "Objection to processing based on our legitimate interest (Art. 21 GDPR).",
      "Withdrawal of consent – at any time, with effect for the future (Art. 7(3) GDPR).",
    ],
    beschwerde: "You can also complain to a data protection supervisory authority (Art. 77 GDPR). The authority responsible for us is: Die Landesbeauftragte für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hannover, Germany.",
    kontakt: "For all questions about privacy and to exercise your rights, write to us at ",
  },
  fr: {
    metaTitel: "Protection des données",
    metaText: "Quelles données ce site traite, pourquoi et pendant combien de temps. Et quels sont tes droits.",
    eyebrow: "Mentions",
    titel: "Protection des données",
    heroText: "Ce que ce site fait de tes données – avec des mots simples.",
    krume: "Protection des données",
    verantwortlichTitel: "Qui est responsable",
    verantwortlichVor: "Le responsable du traitement des données sur ce site est :",
    vertreten: `représentée par les associés ${B.vertreten.replace(" und ", " et ")}`,
    telefonLabel: "Téléphone",
    emailLabel: "E-mail",
    dsb: "Nous n'avons pas désigné de délégué à la protection des données, car la loi ne nous y oblige pas. Pour toute question sur la protection des données, écris-nous simplement à l'adresse e-mail ci-dessus.",
    hostingTitel: "Quand tu ouvres le site (hébergement)",
    hosting: `Ce site est hébergé chez ${H.name} (${H.firma}, 61 Lordou Vironos Street, 6023 Larnaca, Chypre). Quand tu ouvres le site, le serveur traite les données techniquement nécessaires : ton adresse IP, la date et l'heure, la page demandée, la page d'où tu viens ainsi que ton navigateur et ton système d'exploitation. Cela sert au fonctionnement sûr et stable du site. La base juridique est notre intérêt légitime (art. 6, par. 1, point f du RGPD). ${H.name} traite ces données pour notre compte (art. 28 du RGPD) et ne peut pas les utiliser à ses propres fins. Les données sont supprimées dès qu'elles ne sont plus nécessaires à cette fin.`,
    schriften: "Les polices viennent de notre propre serveur. Aucun fichier de police n'est chargé depuis d'autres entreprises. Aucun contenu externe, aucune carte ni vidéo ne sont intégrés.",
    rechnerTitel: "Simulateur",
    rechner: "Le simulateur calcule entièrement dans ton navigateur. Ce que tu saisis n'est pas envoyé à notre serveur et n'est pas enregistré. Si tu cliques sur « demander un conseiller » dans le résultat, nous gardons les valeurs uniquement dans ton navigateur pour le formulaire. Elles ne sont transmises que lorsque tu envoies le formulaire – et seulement si tu ne les retires pas.",
    cookiesTitel: "Cookies et stockage dans le navigateur",
    cookiesVor: "Nous ne déposons pas de cookies. Dans le stockage local de ton navigateur, nous ne gardons qu'une chose : ton choix dans les ",
    cookiesLink: "réglages des cookies",
    cookiesNach: " – et seulement quand tu y enregistres quelque chose. C'est techniquement nécessaire pour que nous puissions respecter ta décision (§ 25, al. 2, n° 2 TDDDG).",
    messungTitel: "Compter les visiteurs et publicité",
    messung: "Aucun service d'analyse ni aucun service publicitaire n'est intégré. Aucune donnée ne part vers des réseaux sociaux ou des plateformes publicitaires. Si nous voulons un jour compter comment le site est utilisé, ce sera seulement avec ton accord – et ce sera alors décrit ici.",
    emailTitel: "Quand tu nous écris un e-mail",
    email: (tage: number) => `Nous traitons ton adresse e-mail et le contenu de ton message pour te répondre. La base juridique est l'art. 6, par. 1, point b du RGPD s'il s'agit d'une demande concernant notre offre, sinon notre intérêt légitime à répondre aux messages (art. 6, par. 1, point f du RGPD). Notre boîte e-mail est elle aussi hébergée chez ${H.name}, qui conserve les messages pour notre compte. Nous supprimons le message une fois ta question réglée, au plus tard après ${tage} jours – sauf si une loi nous oblige à le conserver plus longtemps.`,
    anfrageTitel: "Quand tu envoies une demande par le formulaire",
    zeilen: {
      welche: ["Quelles données", "Nom, téléphone, adresse e-mail et code postal, ainsi que ta demande et ta profession. Facultatif : un message. Si tu viens du simulateur, nous t'en montrons les valeurs dans le formulaire – elles ne sont envoyées que si tu les y laisses. En plus : la date et l'heure et le texte exact de ton consentement."],
      nicht: ["Ce que nous n'enregistrons pas", "L'adresse IP et l'identifiant du navigateur dans la fiche de la demande, des données de santé, des numéros de compte et des montants de revenu exacts."],
      zweck: ["Pour quoi faire", "Pour transmettre ta demande à un conseiller adapté près de chez toi afin qu'il te contacte. Nous utilisons le code postal pour trouver quelqu'un près de chez toi."],
      grundlage: ["Base juridique", "Ton consentement dans le formulaire (art. 6, par. 1, point a du RGPD) et ta demande (art. 6, par. 1, point b du RGPD). Le consentement couvre la transmission à un conseiller de notre liste de partenaires publiée et son contact par téléphone ou e-mail. Tu peux le retirer à tout moment – un court e-mail suffit."],
      empfaengerTitel: "Qui reçoit les données",
      empfaenger: (n: string) => `${n} et un conseiller adapté de notre liste de partenaires (voir la page « Conseil »), à qui nous transmettons les données du formulaire. Nous te disons par e-mail de qui il s'agit. Le conseiller traite ensuite tes données sous sa propre responsabilité pour te contacter et doit t'informer lui-même sur sa protection des données. Le conseiller peut nous payer pour le contact transmis. Techniquement, les données sont traitées par notre hébergeur et fournisseur de messagerie (voir plus haut).`,
      kampagne: ["Lien avec une campagne", "Tu es arrivé par un lien de campagne ? Alors nous enregistrons avec la demande les informations générales de la campagne (source, support, nom de la campagne) et le chemin de la page par laquelle tu es entré. Nous n'enregistrons ni identifiants de clic ni identifiant d'utilisateur."],
      dauerTitel: "Pendant combien de temps",
      dauer: (tage: number) => `Nous supprimons ta demande au plus tard ${tage} jours après sa réception – sauf si une loi nous oblige à conserver quelque chose plus longtemps.`,
      schutz: PER_SKRIPT
        ? ["Comment la demande est envoyée", `Quand tu appuies sur Envoyer, un petit programme sur notre espace web chez ${H.name} envoie tes données par e-mail à ${B.email}. Rien n'est enregistré dans une base de données. Contre les abus, nous vérifions un champ invisible et la durée de saisie, et limitons le nombre de demandes d'une même origine par heure. Pour cela, l'adresse IP est traitée brièvement et uniquement sous une forme non réversible (art. 6, par. 1, point f du RGPD).`]
        : PER_EMAIL
        ? ["Comment la demande est envoyée", `Le formulaire n'envoie rien à notre serveur. Quand tu appuies sur Envoyer, ton propre programme e-mail s'ouvre avec un message prêt à ${B.email}. La demande ne nous parvient que lorsque tu appuies sur Envoyer dans ce programme. La section sur les e-mails ci-dessus s'applique alors aussi à cet e-mail.`]
        : ["Protection contre les abus", "Un champ de formulaire invisible et un contrôle du temps écartent les envois automatiques. Nous limitons aussi le nombre de demandes qui peuvent venir de la même origine. Pour cela, l'adresse IP est traitée brièvement – seulement en mémoire vive et seulement sous la forme d'une valeur à partir de laquelle on ne peut pas retrouver l'adresse (art. 6, par. 1, point f du RGPD)."],
    },
    rechteTitel: "Tes droits",
    rechte: [
      "Accès : tu peux demander quelles données nous avons enregistrées sur toi (art. 15 du RGPD).",
      "Rectification des données inexactes (art. 16 du RGPD).",
      "Suppression de tes données (art. 17 du RGPD).",
      "Limitation du traitement (art. 18 du RGPD).",
      "Portabilité des données : tu peux emporter tes données (art. 20 du RGPD).",
      "Opposition aux traitements fondés sur notre intérêt légitime (art. 21 du RGPD).",
      "Retrait d'un consentement – à tout moment, pour l'avenir (art. 7, par. 3 du RGPD).",
    ],
    beschwerde: "Tu peux aussi déposer une réclamation auprès d'une autorité de protection des données (art. 77 du RGPD). L'autorité compétente pour nous est : Die Landesbeauftragte für den Datenschutz Niedersachsen, Prinzenstraße 5, 30159 Hanovre, Allemagne.",
    kontakt: "Pour toute question sur la protection des données et pour exercer tes droits, écris-nous à ",
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
          <h2>{t.verantwortlichTitel}</h2>
          <p>{t.verantwortlichVor}</p>
          <p>
            <strong>{B.firma}</strong>, {t.vertreten}<br />
            {B.strasse}, {B.ort}<br />
            {t.emailLabel}: <a href={`mailto:${B.email}`}>{B.email}</a> · {t.telefonLabel}: <a href={`tel:${B.telefon.replace(/\s/g, "")}`}>{B.telefon}</a>
          </p>
          <p>{t.dsb}</p>

          <h2>{t.hostingTitel}</h2>
          <p>{t.hosting}</p>
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

          <h2>{t.emailTitel}</h2>
          <p>{t.email(AUFBEWAHRUNG_TAGE)}</p>

          <h2>{t.anfrageTitel}</h2>
          <div className="table-wrap">
            <table>
              <tbody>
                <tr><th scope="row">{z.welche[0]}</th><td>{z.welche[1]}</td></tr>
                <tr><th scope="row">{z.nicht[0]}</th><td>{z.nicht[1]}</td></tr>
                <tr><th scope="row">{z.zweck[0]}</th><td>{z.zweck[1]}</td></tr>
                <tr><th scope="row">{z.grundlage[0]}</th><td>{z.grundlage[1]}</td></tr>
                <tr><th scope="row">{z.empfaengerTitel}</th><td>{z.empfaenger(site.name)}</td></tr>
                <tr><th scope="row">{z.kampagne[0]}</th><td>{z.kampagne[1]}</td></tr>
                <tr><th scope="row">{z.dauerTitel}</th><td>{z.dauer(AUFBEWAHRUNG_TAGE)}</td></tr>
                <tr><th scope="row">{z.schutz[0]}</th><td>{z.schutz[1]}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>{t.rechteTitel}</h2>
          <ul>{t.rechte.map((r) => <li key={r}>{r}</li>)}</ul>
          <p>{t.kontakt}<a href={`mailto:${B.email}`}>{B.email}</a>.</p>
          <p>{t.beschwerde}</p>
        </div>
      </section>
    </>
  );
}
