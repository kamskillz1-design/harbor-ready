import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/useI18n";

export default function ErrorState({ onRetry }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center" role="alert">
      <AlertCircle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-muted-foreground">{t("errors.DEPENDENCY_UNAVAILABLE")}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {t("common.tryAgain")}
        </Button>
      )}
    </div>
  );
}