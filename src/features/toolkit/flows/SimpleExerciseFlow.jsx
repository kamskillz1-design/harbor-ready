import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/useI18n";
import { ACTION_MAX, REFLECTION_MAX } from "@/domain/validation/exercise";

function HelpfulnessPicker({ value, onChange, t }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{t("toolkit.helpfulnessLabel")}</legend>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(value === score ? null : score)}
            aria-pressed={value === score}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              value === score
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            )}
          >
            {t("toolkit.helpfulness." + score)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// Generic guided reflection flow for the simpler exercises.
export default function SimpleExerciseFlow({ slug, questionKey, showAction, saving, onComplete, onCancel }) {
  const { t } = useI18n();
  const [reflection, setReflection] = useState("");
  const [actionText, setActionText] = useState("");
  const [helpfulnessScore, setHelpfulnessScore] = useState(null);

  return (
    <div className="space-y-5">
      <p className="rounded-2xl bg-secondary/60 p-4 text-sm leading-relaxed text-secondary-foreground">
        {t(questionKey)}
      </p>
      <div className="space-y-2">
        <Label htmlFor="reflection">{t("toolkit.reflectionLabel")}</Label>
        <Textarea
          id="reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          maxLength={REFLECTION_MAX}
          rows={5}
        />
      </div>
      {showAction && (
        <div className="space-y-2">
          <Label htmlFor="actionText">{t("exercises.small-step-planner.actionLabel")}</Label>
          <Input
            id="actionText"
            value={actionText}
            onChange={(e) => setActionText(e.target.value)}
            maxLength={ACTION_MAX}
          />
        </div>
      )}
      <HelpfulnessPicker value={helpfulnessScore} onChange={setHelpfulnessScore} t={t} />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() => onComplete({ exerciseSlug: slug, reflection, actionText, helpfulnessScore })}
          disabled={saving}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {t("toolkit.saveSession")}
        </Button>
      </div>
    </div>
  );
}

export { HelpfulnessPicker };