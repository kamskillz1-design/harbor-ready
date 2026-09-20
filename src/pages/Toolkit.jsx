import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageLoader from "@/components/PageLoader";
import ErrorState from "@/components/ErrorState";
import SimpleExerciseFlow from "@/features/toolkit/flows/SimpleExerciseFlow";
import GroundingFlow from "@/features/toolkit/flows/GroundingFlow";
import BreathingFlow from "@/features/toolkit/flows/BreathingFlow";
import ThoughtRecordFlow from "@/features/toolkit/flows/ThoughtRecordFlow";
import SessionList from "@/features/toolkit/SessionList";
import { useI18n } from "@/i18n/useI18n";
import { completeExercise, deleteSession, listSessions, listTemplates } from "@/app/services/toolkitService";
import { AppError } from "@/domain/errors";

// Which flow renders for each exercise slug.
function flowFor(slug) {
  switch (slug) {
    case "grounding-54321":
      return GroundingFlow;
    case "slow-breathing":
      return BreathingFlow;
    case "thought-record":
      return ThoughtRecordFlow;
    default:
      return SimpleExerciseFlow;
  }
}

function questionKeyFor(slug) {
  if (slug === "evidence-check" || slug === "self-compassion" || slug === "small-step-planner") {
    return "exercises." + slug + ".question";
  }
  return null;
}

export default function Toolkit() {
  const { t } = useI18n();
  const [templates, setTemplates] = useState(undefined);
  const [sessions, setSessions] = useState(undefined);
  const [error, setError] = useState(false);
  const [activeSlug, setActiveSlug] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const [loadedTemplates, loadedSessions] = await Promise.all([listTemplates(), listSessions(10)]);
      setTemplates(loadedTemplates);
      setSessions(loadedSessions);
    } catch (e) {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("toolkit.title")}</h1>
        <ErrorState onRetry={load} />
      </div>
    );
  }
  if (templates === undefined || sessions === undefined) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("toolkit.title")}</h1>
        <PageLoader />
      </div>
    );
  }

  const activeTemplate = templates.find((template) => template.slug === activeSlug);
  const Flow = activeSlug ? flowFor(activeSlug) : null;

  const handleComplete = async (payload) => {
    setSaving(true);
    setError(false);
    try {
      await completeExercise(payload);
      setActiveSlug(null);
      await load();
    } catch (err) {
      if (err instanceof AppError && err.code === "VALIDATION_FAILED") {
        window.alert(t("errors.VALIDATION_FAILED"));
      } else {
        setError(true);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t("toolkit.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("toolkit.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <section key={template.slug} className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-foreground">{t(template.titleKey)}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {t(template.descriptionKey)}
            </p>
            <Button className="mt-5 self-start" onClick={() => setActiveSlug(template.slug)}>
              {t("toolkit.start")}
            </Button>
          </section>
        ))}
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
          {t("toolkit.sessionsTitle")}
        </h2>
        <SessionList
          sessions={sessions}
          onDelete={(session) => {
            deleteSession(session.id).finally(() => load());
          }}
        />
      </section>

      <Dialog open={!!activeSlug} onOpenChange={(open) => !open && setActiveSlug(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{activeTemplate ? t(activeTemplate.titleKey) : ""}</DialogTitle>
          </DialogHeader>
          {activeSlug === "thought-record" && (
            <p className="text-xs text-muted-foreground">{t("exercises.thought-record.purpose")}</p>
          )}
          {Flow && (
            <Flow
              slug={activeSlug}
              questionKey={questionKeyFor(activeSlug)}
              showAction={activeSlug === "small-step-planner"}
              saving={saving}
              onComplete={handleComplete}
              onCancel={() => setActiveSlug(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}