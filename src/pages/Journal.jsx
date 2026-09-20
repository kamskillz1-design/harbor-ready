import React, { useCallback, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLoader from "@/components/PageLoader";
import ErrorState from "@/components/ErrorState";
import EntryEditor from "@/features/journal/EntryEditor";
import JournalList from "@/features/journal/JournalList";
import { useI18n } from "@/i18n/useI18n";
import {
  deleteEntry,
  listEntries,
  matchesEntry
} from "@/app/services/journalService";

const PAGE_SIZE = 20;

export default function Journal() {
  const { t } = useI18n();
  const [entries, setEntries] = useState(undefined);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setError(false);
    try {
      const loaded = await listEntries(limit);
      setEntries(loaded);
    } catch (e) {
      setError(true);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("journal.title")}</h1>
        <ErrorState onRetry={load} />
      </div>
    );
  }
  if (entries === undefined) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("journal.title")}</h1>
        <PageLoader />
      </div>
    );
  }

  const visible = query ? entries.filter((entry) => matchesEntry(entry, query)) : entries;

  const handleNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const handleEdit = (entry) => {
    setEditing(entry);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t("journal.title")}</h1>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          {t("journal.new")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("journal.searchPlaceholder")}
          aria-label={t("common.search")}
          className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center">
          <h2 className="font-display text-lg font-semibold text-foreground">{t("journal.emptyTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("journal.emptyBody")}</p>
          <Button className="mt-5" onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {t("journal.new")}
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{t("journal.noMatches")}</p>
      ) : (
        <JournalList
          entries={visible}
          hasMore={!query && entries.length === limit}
          onLoadMore={() => setLimit((current) => current + PAGE_SIZE)}
          onEdit={handleEdit}
          onDelete={(entry) => {
            deleteEntry(entry.id).finally(() => load());
          }}
        />
      )}

      <EntryEditor
        open={editorOpen}
        entry={editing}
        onClose={() => setEditorOpen(false)}
        onSaved={() => {
          setEditorOpen(false);
          load();
        }}
      />
    </div>
  );
}