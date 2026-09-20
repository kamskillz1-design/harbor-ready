import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/PageLoader";
import ErrorState from "@/components/ErrorState";
import GoalCard from "@/features/goals/GoalCard";
import GoalForm from "@/features/goals/GoalForm";
import { useI18n } from "@/i18n/useI18n";
import {
  countActive,
  createGoal,
  listGoals,
  markGoalDone,
  updateGoalStatus
} from "@/app/services/goalService";
import { MAX_ACTIVE_GOALS } from "@/domain/validation/goal";
import { AppError } from "@/domain/errors";

const STATUS_ORDER = { active: 0, paused: 1, completed: 2, archived: 3 };

export default function Plan() {
  const { t } = useI18n();
  const [goals, setGoals] = useState(undefined);
  const [error, setError] = useState(false);
  const [limitError, setLimitError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      setGoals(await listGoals());
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
        <h1 className="font-display text-3xl font-semibold">{t("plan.title")}</h1>
        <ErrorState onRetry={load} />
      </div>
    );
  }
  if (goals === undefined) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("plan.title")}</h1>
        <PageLoader />
      </div>
    );
  }

  const activeCount = countActive(goals);
  const sorted = [...goals].sort((a, b) => {
    const byStatus = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    if (byStatus !== 0) return byStatus;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });

  const withBusy = (goal, action) => async () => {
    setBusyId(goal.id);
    try {
      await action();
    } finally {
      setBusyId(null);
      await load();
    }
  };

  const handleCreate = async (input) => {
    setCreating(true);
    setLimitError(false);
    try {
      await createGoal(input);
      setFormOpen(false);
      await load();
    } catch (err) {
      if (err instanceof AppError && err.code === "CONFLICT") setLimitError(true);
      else setLimitError(true);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold text-foreground">{t("plan.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("plan.subtitle")}</p>
        </div>
        <Button onClick={() => setFormOpen((open) => !open)} disabled={activeCount >= MAX_ACTIVE_GOALS}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("plan.newGoal")}
        </Button>
      </div>

      {activeCount >= MAX_ACTIVE_GOALS && <p className="text-sm text-muted-foreground">{t("plan.limitReached")}</p>}
      {limitError && <p className="text-sm text-destructive" role="alert">{t("plan.limitReached")}</p>}

      {formOpen && <GoalForm onCreate={handleCreate} onCancel={() => setFormOpen(false)} creating={creating} />}

      {goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center">
          <h2 className="font-display text-lg font-semibold text-foreground">{t("plan.emptyTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("plan.emptyBody")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {sorted.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              busy={busyId === goal.id}
              onMarkDone={withBusy(goal, () => markGoalDone(goal))}
              onPause={withBusy(goal, () => updateGoalStatus(goal, "paused"))}
              onResume={withBusy(goal, () => updateGoalStatus(goal, "active"))}
              onComplete={withBusy(goal, () => updateGoalStatus(goal, "completed"))}
              onArchive={withBusy(goal, () => updateGoalStatus(goal, "archived"))}
            />
          ))}
        </div>
      )}
    </div>
  );
}