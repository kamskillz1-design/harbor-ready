import React from "react";
import { Info } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

export default function SafetyDisclaimer() {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-border bg-secondary/60 p-4 text-sm leading-relaxed text-secondary-foreground">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p>{t("safety.disclaimer")}</p>
      </div>
    </div>
  );
}