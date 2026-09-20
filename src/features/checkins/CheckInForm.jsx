import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ScaleSelector from "@/components/ScaleSelector";
import { useI18n } from "@/i18n/useI18n";
import {
  EMOTION_TAGS,
  MAX_EMOTION_TAGS,
  NOTE_MAX_LENGTH
} from "@/domain/validation/checkIn";
import { saveCheckIn } from "@/app/services/checkInService";
import { AppError } from "@/domain/errors";

const SCALES = [
  { name: "moodScore", prefix: "mood", labelKey: "today.mood" },
  { name: "stressScore", prefix: "stress", labelKey: "today.stress" },
  { name: "energyScore", prefix: "energy", labelKey: "today.energy" },
  { name: "sleepScore", prefix: "sleep", labelKey: "today.sleep" }
];

export default function CheckInForm({ initial, onSaved }) {
  const { t } = useI18n();
  const [values, setValues] = useState(() => ({
    moodScore: initial ? initial.moodScore : null,
    stressScore: initial ? initial.stressScore : null,
    energyScore: initial ? initial.energyScore : null,
    sleepScore: initial ? initial.sleepScore : null,
    emotionTags: initial ? [...initial.emotionTags] : [],
    note: initial && initial.note ? initial.note : ""
  }));
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setScore = (name, score) => {
    setValues((current) => ({ ...current, [name]: current[name] === score ? null : score }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const toggleTag = (tag) => {
    setValues((current) => {
      const has = current.emotionTags.includes(tag);
      if (!has && current.emotionTags.length >= MAX_EMOTION_TAGS) return current;
      return {
        ...current,
        emotionTags: has
          ? current.emotionTags.filter((item) => item !== tag)
          : [...current.emotionTags, tag]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSaving(true);
    try {
      const saved = await saveCheckIn(values);
      onSaved(saved);
    } catch (err) {
      if (err instanceof AppError && err.fields) setFieldErrors(err.fields);
      setError(err instanceof AppError ? t("errors." + err.code) : t("errors.INTERNAL_ERROR"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7" noValidate>
      {SCALES.map((scale) => (
        <div key={scale.name}>
          <ScaleSelector
            label={t(scale.labelKey)}
            name={scale.name}
            value={values[scale.name]}
            onChange={(score) => setScore(scale.name, score)}
            labels={[1, 2, 3, 4, 5].map((score) => t("checkin.scale." + scale.prefix + "." + score))}
          />
          {fieldErrors[scale.name] && (
            <p className="text-xs text-destructive">{t("checkin.scaleRequired")}</p>
          )}
        </div>
      ))}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t("checkin.tagsLabel")}</legend>
        <div className="flex flex-wrap gap-2">
          {EMOTION_TAGS.map((tag) => {
            const selected = values.emotionTags.includes(tag);
            const disabled = !selected && values.emotionTags.length >= MAX_EMOTION_TAGS;
            return (
              <button
                key={tag}
                type="button"
                disabled={disabled}
                onClick={() => toggleTag(tag)}
                aria-pressed={selected}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/40",
                  disabled && "cursor-not-allowed opacity-40"
                )}
              >
                {t("checkin.tags." + tag)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="checkinNote">{t("checkin.noteLabel")}</Label>
        <Textarea
          id="checkinNote"
          value={values.note}
          onChange={(event) => setValues((current) => ({ ...current, note: event.target.value }))}
          maxLength={NOTE_MAX_LENGTH}
          rows={3}
          placeholder={t("checkin.notePlaceholder")}
        />
        <p className="text-right text-xs text-muted-foreground">
          {values.note.length}/{NOTE_MAX_LENGTH}
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {saving ? t("checkin.saving") : t("checkin.save")}
      </Button>
    </form>
  );
}