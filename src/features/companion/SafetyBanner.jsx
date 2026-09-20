import React from "react";
import { Link } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/useI18n";

export default function SafetyBanner() {
  const { t } = useI18n();
  return (
    <aside
      role="alert"
      className="flex flex-col gap-3 rounded-3xl border border-border bg-secondary p-5"
    >
      <div className="flex items-center gap-2">
        <LifeBuoy className="h-5 w-5 text-secondary-foreground" aria-hidden="true" />
        <h3 className="font-display text-base font-semibold text-secondary-foreground">
          {t("companion.safetyTitle")}
        </h3>
      </div>
      <p className="text-sm text-secondary-foreground">{t("companion.safetyBody")}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/help-now">{t("companion.safetyHelp")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/today">{t("companion.safetyContinue")}</Link>
        </Button>
      </div>
    </aside>
  );
}