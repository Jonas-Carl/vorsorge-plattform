import { de, type Texte } from "./de";
import { en } from "./en";
import type { Lang } from "./index";

export type { Texte };

export function texte(lang: Lang): Texte {
  return lang === "en" ? en : de;
}
