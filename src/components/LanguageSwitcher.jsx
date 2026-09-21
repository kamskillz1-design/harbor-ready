import React from "react";
import { useI18n } from "@/i18n/useI18n";
import { getSupportedLanguages } from "@/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageSwitcher() {
  const { t, language, setLanguage } = useI18n();

  return (
    <Select value={language} onValueChange={(code) => setLanguage(code)}>
      <SelectTrigger
        aria-label={t("common.language")}
        className="h-9 w-[9.5rem] shrink-0 rounded-full border-border bg-card px-3 text-xs font-semibold shadow-none"
      >
        <SelectValue placeholder={t("common.language")} />
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[9.5rem]">
        {getSupportedLanguages().map((code) => (
          <SelectItem key={code} value={code} className="text-sm">
            {t("languageName." + code)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
