"use client";

import { useState } from "react";
import { loc, type Lang } from "@/lib/format";

type Props = {
  id: string;
  label: string;
  hint?: string;
  /** Wert in Rechen-Einheiten (z. B. 0.05 für 5 %). */
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  /** Anzeige-Faktor: 100 für Prozentwerte. */
  scale?: number;
  decimals?: number;
  lang?: Lang;
  /** Große Darstellung für die Hauptfragen. */
  gross?: boolean;
  sliderLabel?: string;
  onChange: (v: number) => void;
};

/**
 * Zahlenfeld + Schieberegler, die denselben Wert steuern. Während des Tippens
 * bleibt die Eingabe unverändert stehen; beim Verlassen wird der bereinigte
 * (begrenzte) Wert angezeigt.
 */
export function NumberField({
  id, label, hint, value, min, max, step, unit, scale = 1, decimals = 0, lang = "de", gross = false, sliderLabel, onChange,
}: Props) {
  const [entwurf, setEntwurf] = useState<string | null>(null);

  const anzeige = (v: number) =>
    new Intl.NumberFormat(loc(lang), {
      minimumFractionDigits: 0, maximumFractionDigits: decimals, useGrouping: false,
    }).format(v * scale);
  const begrenze = (v: number) => Math.min(max, Math.max(min, v));
  const fuellung = max > min ? ((begrenze(value) - min) / (max - min)) * 100 : 0;

  function aufEingabe(text: string) {
    setEntwurf(text);
    // Komma und Punkt als Dezimaltrenner akzeptieren.
    const zahl = Number(text.trim().replace(",", "."));
    if (text.trim() !== "" && Number.isFinite(zahl)) onChange(begrenze(zahl / scale));
  }

  return (
    <div className={`field ${gross ? "field--gross" : ""}`}>
      <div className="field__top">
        <label htmlFor={id}>{label}</label>
        <span className="numbox">
          <input
            id={id}
            type="text"
            inputMode={decimals > 0 ? "decimal" : "numeric"}
            autoComplete="off"
            value={entwurf ?? anzeige(value)}
            aria-describedby={hint ? `${id}-hint` : undefined}
            onChange={(e) => aufEingabe(e.target.value)}
            onBlur={() => setEntwurf(null)}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          />
          <span aria-hidden="true">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={begrenze(value)}
        aria-label={`${label} (${sliderLabel ?? "Schieberegler"})`}
        aria-valuetext={`${anzeige(value)} ${unit}`}
        style={{ ["--fill" as string]: `${fuellung}%` }}
        onChange={(e) => {
          setEntwurf(null);
          onChange(Number(e.target.value));
        }}
      />
      {hint && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
    </div>
  );
}
