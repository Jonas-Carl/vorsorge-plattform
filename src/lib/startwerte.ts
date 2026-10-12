import { reform2027 } from "@/config/foerderung";
import { grenzen } from "@/config/szenarien";
import { standardEingabe, type RechnerEingabe } from "@/lib/rechner";

/**
 * Startwerte des einfachen Rechners. Er rechnet mit dem, was gesetzlich
 * feststeht: Zulagen nach §§ 84–86 EStG n. F. und Kosten in Höhe des
 * gesetzlichen Höchstwerts für das Standarddepot.
 *
 * Eigene Datei, damit Rechner (Client) und Startseiten-Grafik (Server)
 * garantiert dieselben Werte verwenden.
 */
export const EINFACHE_STARTWERTE: RechnerEingabe = {
  ...standardEingabe,
  kosten: reform2027.produkt.effektivkostenStandarddepotMax,
  foerderung: { aktiv: true, kinder: 0, kindergeldJahre: grenzen.kindergeldJahre.start },
};
