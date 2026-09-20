import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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

export default function JournalList({ entries, hasMore, onLoadMore, onEdit, onDelete }) {
  const { t, language } = useI18n();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (target) onDelete(target);
  };

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <article
          key={entry.id}
          className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-medium text-foreground">{entry.title || t("journal.untitled")}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(entry.createdAt, language)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onEdit(entry)}
                aria-label={t("common.edit")}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(entry)}
                aria-label={t("common.delete")}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {entry.body.length > 160 ? entry.body.slice(0, 160) + "…" : entry.body}
          </p>
          {entry.promptType && (
            <p className="mt-3 inline-block rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              {t("journal.prompts." + entry.promptType)}
            </p>
          )}
        </article>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="w-full rounded-2xl border border-dashed border-border p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          {t("journal.loadMore")}
        </button>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("journal.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("journal.deleteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              {t("journal.deleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}