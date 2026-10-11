/**
 * GITHUB_PAGES=true erzeugt eine rein statische Vorschau (ohne Server, ohne
 * Lead-API) für GitHub Pages. Der normale Build bleibt unverändert.
 */
const pages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(pages
    ? { output: "export", basePath: process.env.PAGES_BASE_PATH ?? "", trailingSlash: true, images: { unoptimized: true } }
    : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  // Projektverzeichnis für serverseitige Dateipfade (Lead-Speicher in der Entwicklung).
  env: { PROJEKT_VERZEICHNIS: import.meta.dirname },
  ...(pages ? {} : serverRouting()),
};

function serverRouting() {
  return {
  async redirects() {
    // Ohne Sprachpräfix geht es zur deutschen Fassung.
    const seiten = "rechner|reform-2027|wissen|themen|partner|anfrage|ueber-uns|kontakt|impressum|datenschutz|cookie-einstellungen|quellen-methodik|transparenz";
    return [
      { source: "/", destination: "/de", permanent: false },
      { source: `/:seite(${seiten})/:rest*`, destination: "/de/:seite/:rest*", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      {
        // Lead-API: Antworten niemals zwischenspeichern.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
  };
}

export default nextConfig;
