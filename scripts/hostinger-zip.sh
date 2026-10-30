#!/bin/sh
# Baut die Live-Fassung für https://rentekannmehr.de als ZIP-Datei auf dem Schreibtisch.
# Danach: Hostinger → Dateimanager → public_html → ZIP hochladen → entpacken (vorhandene Dateien ersetzen).
# Gebaut wird in einer Kopie, damit das Projekt (und ein laufender Vorschau-Server) unberührt bleibt.
set -e
PROJEKT="$(cd "$(dirname "$0")/.." && pwd)"
ARBEIT="$(mktemp -d)"
ZIEL="$HOME/Desktop/rentekannmehr-hostinger.zip"

echo "→ Kopiere Projekt …"
rsync -a --exclude node_modules --exclude .next --exclude out --exclude .git "$PROJEKT/" "$ARBEIT/"
cp -Rc "$PROJEKT/node_modules" "$ARBEIT/node_modules" 2>/dev/null || cp -R "$PROJEKT/node_modules" "$ARBEIT/node_modules"

cd "$ARBEIT"
# Webhosting ohne Node.js: keine Lead-API, Anfragen gehen als fertige E-Mail an info@.
rm -rf src/app/api

echo "→ Prüfe und baue …"
npm run -s test
GITHUB_PAGES=true PAGES_BASE_PATH="" NEXT_PUBLIC_SITE_URL=https://rentekannmehr.de NEXT_PUBLIC_ANFRAGE_PER_EMAIL=1 NEXT_PUBLIC_ANFRAGE_ZIEL=/anfrage.php npx next build
cp hosting/.htaccess out/.htaccess
# Startadresse leitet auch ohne .htaccess zur deutschen Seite (sonst zeigt Hostinger „403“)
cp hosting/index.html out/index.html
# Formular-Versand: schickt Anfragen direkt an info@ (PHP läuft auf dem Hostinger-Webspace)
cp hosting/anfrage.php out/anfrage.php
# Sichtbare Kopie, weil der Finder Punkt-Dateien ausblendet (in Hostinger in .htaccess umbenennen)
cp hosting/.htaccess out/htaccess.txt

rm -f "$ZIEL"
(cd out && zip -qr "$ZIEL" . -x ".DS_Store")
rm -rf "$ARBEIT"
echo "✓ Fertig: $ZIEL"
