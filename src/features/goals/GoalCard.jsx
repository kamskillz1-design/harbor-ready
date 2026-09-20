import React from "react";
import { Archive, Check, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/useI18n";
import { formatDate } from "@/i18n/formatting";

function ActionButton({ icon: Icon, label, onClick, busy }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={label}
      className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

export default function GoalCard({ goal, busy, onMarkDone, onPause, onResume, onComplete, onArchive }) {
  const { t, language } = useI18n();
  const actions = [];
  if (goal.status === "active") {
    actions.push({ icon: Check, label: t("plan.markDone"), onClick: onMarkDone });
    actions.push({ icon: Pause, label: t("plan.pause"), onClick: onPause });
    actions.push({ icon: Archive, label: t("plan.complete"), onClick: onComplete });
  } else if (goal.status === "paused") {
    actions.push({ icon: Play, label: t("plan.resume"), onClick: onResume });
    actions.push({ icon: Archive, label: t("plan.archive"), onClick: onArchive });
  }

  return (
    <article className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-foreground">{goal.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("goals." + goal.category)}</p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {t("plan.status." + goal.status)}
        </span>
      </div>
      {goal.status === "active" && (
        <p className="text-sm text-muted-foreground">
          {goal.weeklyTarget
            ? t("plan.progress", { count: goal.completionsCount, target: goal.weeklyTarget })
            : t("plan.progressNoTarget", { count: goal.completionsCount })}
        </p>
      )}
      {goal.status === "completed" && goal.completedAt && (
        <p className="text-xs text-muted-foreground">
          {t("plan.completedOn", { date: formatDate(goal.completedAt, language) })}
        </p>
      )}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <ActionButton key={action.label} icon={action.icon} label={action.label} onClick={action.onClick} busy={busy} />
          ))}
        </div>
      )}
    </article>
  );
}