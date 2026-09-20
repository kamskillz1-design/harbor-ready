import React from "react";
import { cn } from "@/lib/utils";

// Accessible 1–5 scale. Labels are supplied by the caller from the dictionary.
export default function ScaleSelector({ label, name, value, onChange, labels }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-medium text-foreground">{label}</legend>
      <div className="grid grid-cols-5 gap-2">
        {labels.map((optionLabel, index) => {
          const score = index + 1;
          const selected = value === score;
          return (
            <button
              key={score}
              type="button"
              name={name}
              onClick={() => onChange(score)}
              aria-pressed={selected}
              className={cn(
                "h-11 rounded-xl border text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {score}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 h-4 text-xs text-muted-foreground" aria-live="polite">
        {value ? labels[value - 1] : ""}
      </p>
    </fieldset>
  );
}