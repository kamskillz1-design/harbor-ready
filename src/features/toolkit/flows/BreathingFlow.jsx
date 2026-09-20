import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/useI18n";
import { HelpfulnessPicker } from "@/features/toolkit/flows/SimpleExerciseFlow";

const DURATIONS = [60, 120, 180];
const CYCLE = 12; // 4s in, 2s hold, 6s out

export default function BreathingFlow({ saving, onComplete, onCancel }) {
  const { t } = useI18n();
  const [phase, setPhase] = useState("select"); // select | running | review
  const [duration, setDuration] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setSeconds((current) => {
        const next = current + 1;
        if (next >= duration) {
          clearInterval(timerRef.current);
          setPhase("review");
          return duration;
        }
        return next;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, duration]);

  const [helpfulnessScore, setHelpfulnessScore] = useState(null);

  if (phase === "select") {
    return (
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("exercises.slow-breathing.purpose")}
        </p>
        <p className="text-sm font-medium">{t("toolkit.durationLabel")}</p>
        <div className="grid grid-cols-3 gap-3">
          {DURATIONS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => {
                setDuration(minutes * 60);
                setSeconds(0);
                setPhase("running");
              }}
              className="rounded-2xl border border-border bg-card py-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
            >
              {t("toolkit.minutes", { count: minutes })}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "running") {
    const inCycle = seconds % CYCLE;
    const stage = inCycle < 4 ? "inhale" : inCycle < 6 ? "hold" : "exhale";
    const remaining = duration - seconds;
    const scaleClass = stage === "exhale" ? "scale-90" : "scale-110";
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="flex h-40 w-40 items-center justify-center">
          <div
            className={cn(
              "h-32 w-32 rounded-full bg-secondary border border-primary/30 transition-transform ease-in-out",
              scaleClass
            )}
            style={{ transitionDuration: stage === "exhale" ? "6000ms" : stage === "inhale" ? "4000ms" : "0ms" }}
          />
        </div>
        <p className="font-display text-2xl font-semibold text-foreground" aria-live="polite">
          {stage === "inhale" ? t("toolkit.inhale") : stage === "hold" ? t("toolkit.hold") : t("toolkit.exhale")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("toolkit.minutes", { count: Math.max(1, Math.ceil(remaining / 60)) })}
        </p>
        <Button variant="ghost" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-foreground">{t("toolkit.breathingDone")}</p>
      <HelpfulnessPicker value={helpfulnessScore} onChange={setHelpfulnessScore} t={t} />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={() => onComplete({ exerciseSlug: "slow-breathing", durationSeconds: duration, helpfulnessScore })}
          disabled={saving}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {t("toolkit.saveSession")}
        </Button>
      </div>
    </div>
  );
}