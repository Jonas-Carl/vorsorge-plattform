import { de, type Texte } from "./de";
import { en } from "./en";
import { fr } from "./fr";
import type { Lang } from "./index";

export type { Texte };

const TEXTE: Record<Lang, Texte> = { de, en, fr };

export function texte(lang: Lang): Texte {
  return TEXTE[lang];
}
