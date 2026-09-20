import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/useI18n";
import { HelpfulnessPicker } from "@/features/toolkit/flows/SimpleExerciseFlow";
import { EMOTION_TAGS } from "@/domain/validation/checkIn";
import { LONG_MAX, MAX_EMOTIONS, PLAN_MAX, SHORT_MAX, validateThoughtRecordForm } from "@/domain/validation/exercise";

const STEP_KEYS = [
  { id: "situation", hint: "tr.situationHint", max: SHORT_MAX, required: true },
  { id: "automaticThought", hint: "tr.automaticThoughtHint", max: SHORT_MAX, required: true },
  { id: "emotions" },
  { id: "evidenceFor", hint: "tr.evidenceForHint", max: LONG_MAX, required: false },
  { id: "evidenceAgainst", hint: "tr.evidenceAgainstHint", max: LONG_MAX, required: false },
  { id: "balancedThought", hint: "tr.balancedThoughtHint", max: LONG_MAX, required: true },
  { id: "actionPlan", hint: "tr.actionPlanHint", max: PLAN_MAX, required: false }
];
const FINAL_STEP = STEP_KEYS.length;

export default function ThoughtRecordFlow({ saving, onComplete, onCancel }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    situation: "",
    automaticThought: "",
    emotions: [],
    evidenceFor: "",
    evidenceAgainst: "",
    balancedThought: "",
    actionPlan: ""
  });
  const [fieldError, setFieldError] = useState(false);
  const [helpfulnessScore, setHelpfulnessScore] = useState(null);

  const setText = (field, value) => {
    setData((current) => ({ ...current, [field]: value }));
    setFieldError(false);
  };

  const toggleEmotion = (code) => {
    setData((current) => {
      const existing = current.emotions.find((e) => e.code === code);
      if (existing) {
        return { ...current, emotions: current.emotions.filter((e) => e.code !== code) };
      }
      if (current.emotions.length >= MAX_EMOTIONS) return current;
      return { ...current, emotions: [...current.emotions, { code: code, intensity: 3 }] };
    });
    setFieldError(false);
  };

  const setIntensity = (code, intensity) => {
    setData((current) => ({
      ...current,
      emotions: current.emotions.map((e) => (e.code === code ? { code: code, intensity: intensity } : e))
    }));
  };

  const goNext = () => {
    const stepConfig = STEP_KEYS[step];
    if (stepConfig && stepConfig.id === "emotions" && data.emotions.length < 1) {
      setFieldError(true);
      return;
    }
    setStep((current) => current + 1);
  };

  const save = () => {
    const validated = validateThoughtRecordForm(data);
    if (!validated.valid) {
      setFieldError(true);
      return;
    }
    onComplete({ exerciseSlug: "thought-record", helpfulnessScore, thoughtRecord: validated.value });
  };

  const isFinal = step >= FINAL_STEP;

  return (
    <div className="space-y-5">
      {!isFinal ? (
        <>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {step + 1} / {FINAL_STEP}
          </p>
          {STEP_KEYS[step].id === "emotions" ? (
            <div className="space-y-3">
              <Label>{t("tr.emotions")}</Label>
              <p className="text-xs text-muted-foreground">{t("tr.emotionsHint")}</p>
              <div className="flex flex-wrap gap-2">
                {EMOTION_TAGS.map((code) => {
                  const selected = data.emotions.find((e) => e.code === code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleEmotion(code)}
                      aria-pressed={!!selected}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/40"
                      )}
                    >
                      {t("checkin.tags." + code)}
                    </button>
                  );
                })}
              </div>
              {data.emotions.length > 0 && (
                <div className="space-y-3 pt-2">
                  {data.emotions.map((emotion) => (
                    <div key={emotion.code} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-3">
                      <span className="text-sm">{t("checkin.tags." + emotion.code)}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setIntensity(emotion.code, n)}
                            aria-label={t("tr.intensity") + " " + n}
                            aria-pressed={emotion.intensity === n}
                            className={cn(
                              "h-8 w-8 rounded-full border text-xs font-semibold transition-colors",
                              emotion.intensity === n
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground"
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {fieldError && <p className="text-xs text-destructive">{t("tr.noneSelected")}</p>}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={STEP_KEYS[step].id}>{t("tr." + STEP_KEYS[step].id)}</Label>
              <p className="text-xs text-muted-foreground">{t(STEP_KEYS[step].hint)}</p>
              <Textarea
                id={STEP_KEYS[step].id}
                value={data[STEP_KEYS[step].id]}
                onChange={(e) => setText(STEP_KEYS[step].id, e.target.value)}
                maxLength={STEP_KEYS[step].max}
                rows={5}
                aria-invalid={fieldError}
              />
              {fieldError && <p className="text-xs text-destructive">{t("tr.required")}</p>}
            </div>
          )}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep((current) => Math.max(current - 1, 0))}>
              {t("common.back")}
            </Button>
            <Button onClick={goNext}>{t("common.next")}</Button>
          </div>
        </>
      ) : (
        <>
          <HelpfulnessPicker value={helpfulnessScore} onChange={setHelpfulnessScore} t={t} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onCancel} disabled={saving}>
              {t("common.cancel")}
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {t("toolkit.saveSession")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}