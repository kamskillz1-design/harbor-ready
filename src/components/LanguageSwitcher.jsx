import React from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/useI18n";
import { getSupportedLanguages } from "@/i18n";

// The single language switcher. It only talks to the central language module.
export default function LanguageSwitcher() {
  const { t, language, setLanguage } = useI18n();
  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className="inline-flex overflow-hidden rounded-full border border-border bg-card p-0.5"
    >
      {getSupportedLanguages().map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={t("languageName." + code)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
            language === code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}