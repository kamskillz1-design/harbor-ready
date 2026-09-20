import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/useI18n";
import { HelpfulnessPicker } from "@/features/toolkit/flows/SimpleExerciseFlow";
import { REFLECTION_MAX } from "@/domain/validation/exercise";

const STEPS = ["step1", "step2", "step3", "step4", "step5"];

export default function GroundingFlow({ saving, onComplete, onCancel }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState(["", "", "", "", ""]);
  const [helpfulnessScore, setHelpfulnessScore] = useState(null);

  const setNote = (index, value) => {
    setNotes((current) => current.map((note, i) => (i === index ? value : note)));
  };

  const isReview = step >= STEPS.length;

  return (
    <div className="space-y-5">
      {!isReview ? (
        <>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {step + 1} / {STEPS.length}
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {t("exercises.grounding-54321." + STEPS[step])}
          </p>
          <Textarea
            value={notes[step]}
            onChange={(e) => setNote(step, e.target.value)}
            rows={3}
            maxLength={500}
            aria-label={t("toolkit.reflectionLabel")}
          />
          <p className="text-xs text-muted-foreground">{t("exercises.grounding-54321.hint")}</p>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep((current) => Math.max(current - 1, 0))}>
              {t("common.back")}
            </Button>
            <Button onClick={() => setStep((current) => current + 1)}>{t("common.next")}</Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm leading-relaxed text-foreground">{t("toolkit.breathingDone")}</p>
          <HelpfulnessPicker value={helpfulnessScore} onChange={setHelpfulnessScore} t={t} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onCancel} disabled={saving}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                const reflection = notes
                  .map((note, index) => (note.trim() ? t("exercises.grounding-54321." + STEPS[index]) + "\n" + note.trim() : null))
                  .filter(Boolean)
                  .join("\n\n")
                  .slice(0, REFLECTION_MAX);
                onComplete({ exerciseSlug: "grounding-54321", reflection, helpfulnessScore });
              }}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {t("toolkit.saveSession")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}