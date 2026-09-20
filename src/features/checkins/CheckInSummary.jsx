import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

const SCORES = [
  { name: "moodScore", prefix: "mood", labelKey: "today.mood" },
  { name: "stressScore", prefix: "stress", labelKey: "today.stress" },
  { name: "energyScore", prefix: "energy", labelKey: "today.energy" },
  { name: "sleepScore", prefix: "sleep", labelKey: "today.sleep" }
];

export default function CheckInSummary({ checkIn, onEdit }) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SCORES.map((score) => (
          <div key={score.name} className="rounded-2xl border border-border bg-secondary/50 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t(score.labelKey)}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">
              {checkIn[score.name]}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("checkin.scale." + score.prefix + "." + checkIn[score.name])}
            </p>
          </div>
        ))}
      </div>

      {checkIn.emotionTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {checkIn.emotionTags.map((tag) => (
            <span key={tag} className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground">
              {t("checkin.tags." + tag)}
            </span>
          ))}
        </div>
      )}

      {checkIn.note && (
        <blockquote className="rounded-2xl border border-border bg-card p-4 text-sm italic leading-relaxed text-muted-foreground">
          {checkIn.note}
        </blockquote>
      )}

      <Button variant="outline" onClick={onEdit}>
        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
        {t("today.editCheckIn")}
      </Button>
    </div>
  );
}