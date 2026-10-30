<?php
/**
 * Beratungsanfrage → E-Mail an das Postfach von RenteKannMehr (Hostinger).
 *
 * Wird vom Bau-Skript (scripts/hostinger-zip.sh) nach public_html kopiert.
 * Das Formular schickt die Anfrage als JSON hierher; dieses Skript prüft sie und
 * verschickt sie mit PHP mail() an EMPFAENGER. Es speichert nichts dauerhaft.
 *
 * Schutz vor Missbrauch: nur POST, Honeypot-Feld, Mindest-Ausfülldauer, Größenlimits,
 * keine Zeilenumbrüche in Kopfzeilen (gegen Header-Injection), einfache Begrenzung
 * pro Absender (gehashte IP, nur kurz im Temp-Ordner).
 */

const EMPFAENGER = 'info@rentekannmehr.de';
const ABSENDER = 'info@rentekannmehr.de';
const MAX_PRO_STUNDE = 5;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function antwort(int $status, array $daten): void {
    http_response_code($status);
    echo json_encode($daten, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Text säubern: Steuerzeichen raus, trimmen, kürzen. */
function text($wert, int $max): string {
    if (!is_string($wert)) return '';
    $wert = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', ' ', $wert) ?? '';
    return mb_substr(trim($wert), 0, $max);
}

/** Für Kopfzeilen: zusätzlich keine Zeilenumbrüche. */
function einzeilig($wert, int $max): string {
    return str_replace(["\r", "\n"], ' ', text($wert, $max));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antwort(405, ['ok' => false, 'code' => 'methode']);
}

$roh = file_get_contents('php://input', false, null, 0, 20000);
$a = json_decode($roh ?: '', true);
if (!is_array($a)) {
    antwort(400, ['ok' => false, 'code' => 'ungueltige_anfrage']);
}

// Bots: Honeypot ausgefüllt oder unrealistisch schnell → so tun, als hätte es geklappt.
if (text($a['website'] ?? '', 200) !== '' || (int)($a['ausfuelldauerMs'] ?? 0) < 2500) {
    antwort(200, ['ok' => true]);
}

// Einfache Begrenzung pro Absender (gehashte IP, nur im Temp-Ordner, nach einer Stunde bedeutungslos).
$ipHash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . date('Y-m-d-H') . __FILE__);
$zaehlerDatei = sys_get_temp_dir() . '/rkm-' . substr($ipHash, 0, 24);
$anzahl = is_file($zaehlerDatei) ? (int)file_get_contents($zaehlerDatei) : 0;
if ($anzahl >= MAX_PRO_STUNDE) {
    antwort(429, ['ok' => false, 'code' => 'zu_viele_anfragen']);
}
@file_put_contents($zaehlerDatei, (string)($anzahl + 1));

$vorname   = einzeilig($a['vorname'] ?? '', 60);
$nachname  = einzeilig($a['nachname'] ?? '', 60);
$email     = einzeilig($a['email'] ?? '', 254);
$telefon   = einzeilig($a['telefon'] ?? '', 25);
$plz       = preg_replace('/\D/', '', einzeilig($a['plz'] ?? '', 10));
$weg       = ($a['kontaktweg'] ?? '') === 'telefon' ? 'Telefon' : 'E-Mail';
$zeit      = einzeilig($a['kontaktzeitText'] ?? '', 40);
$thema     = einzeilig($a['anliegenText'] ?? '', 120);
$nachricht = text($a['nachricht'] ?? '', 1000);
$einwilligung = text($a['einwilligungstext'] ?? '', 600);
$version   = einzeilig($a['einwilligungVersion'] ?? '', 40);
$sprache   = einzeilig($a['sprache'] ?? 'de', 5);
// Angaben zur Situation und ggf. Werte aus dem Rechner – vom Formular schon lesbar aufbereitet.
$situation = [];
if (is_array($a['situation'] ?? null)) {
    foreach (array_slice($a['situation'], 0, 15) as $zeile) {
        $zeile = einzeilig($zeile, 300);
        if ($zeile !== '') $situation[] = $zeile;
    }
}

// Gleiche Grundregeln wie im Formular (lib/leads/validation.ts).
$fehler = [];
if ($vorname === '') $fehler[] = 'vorname';
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $fehler[] = 'email';
if ($telefon === '') $fehler[] = 'telefon';
if (strlen($plz) !== 5) $fehler[] = 'plz';
if (($a['einwilligung'] ?? false) !== true || $einwilligung === '') $fehler[] = 'einwilligung';
if ($fehler) {
    antwort(422, ['ok' => false, 'code' => 'validierung', 'felder' => $fehler]);
}

$zeitpunkt = date('d.m.Y H:i');
$zeilen = [
    'Neue Beratungsanfrage über rentekannmehr.de',
    '',
    'Name: ' . trim("$vorname $nachname"),
    'E-Mail: ' . $email,
    'Postleitzahl: ' . ($plz !== '' ? $plz : '–'),
    'Kontakt gewünscht per: ' . $weg,
];
if ($telefon !== '') $zeilen[] = 'Telefon: ' . $telefon;
if ($weg === 'Telefon' && $zeit !== '') $zeilen[] = 'Erreichbar: ' . $zeit;
$zeilen[] = 'Thema: ' . ($thema !== '' ? $thema : '–');
if ($situation) {
    $zeilen[] = '';
    $zeilen[] = '— Situation —';
    foreach ($situation as $zeile) $zeilen[] = $zeile;
}
if ($nachricht !== '') {
    $zeilen[] = '';
    $zeilen[] = 'Nachricht:';
    $zeilen[] = $nachricht;
}
$zeilen[] = '';
$zeilen[] = '— Einwilligung (Nachweis) —';
$zeilen[] = 'Zeitpunkt: ' . $zeitpunkt . ' · Sprache: ' . $sprache . ' · Textversion: ' . $version;
$zeilen[] = $einwilligung;
$zeilen[] = '';
$zeilen[] = 'Wichtig: Nur an einen Berater aus der veröffentlichten Partnerliste weitergeben und der Person per E-Mail mitteilen, an wen. Nach spätestens 180 Tagen löschen.';

$betreff = 'Beratungsanfrage: ' . ($thema !== '' ? $thema : 'Allgemein') . ($plz !== '' ? " ($plz)" : '');
$kopf = [
    'From: RenteKannMehr <' . ABSENDER . '>',
    'Reply-To: ' . ($nachname !== '' || $vorname !== '' ? '"' . str_replace('"', '', trim("$vorname $nachname")) . '" ' : '') . '<' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

$ok = mail(
    EMPFAENGER,
    '=?UTF-8?B?' . base64_encode($betreff) . '?=',
    implode("\r\n", $zeilen),
    implode("\r\n", $kopf),
    '-f' . ABSENDER
);

if (!$ok) {
    antwort(500, ['ok' => false, 'code' => 'serverfehler']);
}
antwort(200, ['ok' => true]);
