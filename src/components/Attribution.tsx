"use client";

import { useEffect } from "react";
import { merkeAttribution } from "@/lib/analytics";

/** Merkt Kampagnenparameter der Einstiegsseite – nur im Arbeitsspeicher. */
export function Attribution() {
  useEffect(() => {
    merkeAttribution();
  }, []);
  return null;
}
