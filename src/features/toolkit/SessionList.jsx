import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/i18n/useI18n";
import { formatDate } from "@/i18n/formatting";

export default function SessionList({ sessions, onDelete }) {
  const { t, language } = useI18n();
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("toolkit.sessionsEmpty")}</p>;
  }

  return (
    <>
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {t("exercises." + session.exerciseSlug + ".title")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(session.completedAt || session.createdAt, language)}
                {session.helpfulnessScore ? " · " + t("toolkit.helpfulness." + session.helpfulnessScore) : ""}
                {session.durationSeconds ? " · " + t("toolkit.minutes", { count: Math.round(session.durationSeconds / 60) }) : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteTarget(session)}
              aria-label={t("toolkit.deleteSession")}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("toolkit.deleteSessionConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("journal.deleteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) onDelete(target);
              }}
            >
              {t("journal.deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}