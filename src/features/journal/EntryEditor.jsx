import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ScaleSelector from "@/components/ScaleSelector";
import { useI18n } from "@/i18n/useI18n";
import { AppError } from "@/domain/errors";
import {
  BODY_MAX_LENGTH,
  PROMPT_TYPES,
  TITLE_MAX_LENGTH,
  validateJournalForm
} from "@/domain/validation/journal";
import { createEntry, updateEntry } from "@/app/services/journalService";

export default function EntryEditor({ open, entry, onClose, onSaved }) {
  const { t } = useI18n();
  const [values, setValues] = useState({ title: "", promptType: "", body: "", moodScore: null });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({
        title: entry && entry.title ? entry.title : "",
        promptType: entry && entry.promptType ? entry.promptType : "",
        body: entry ? entry.body : "",
        moodScore: entry && entry.moodScore ? entry.moodScore : null
      });
      setFieldErrors({});
      setError("");
    }
  }, [open, entry]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSave = async () => {
    setError("");
    setFieldErrors({});
    const validated = validateJournalForm(values);
    if (!validated.valid) {
      setFieldErrors(validated.errors);
      setError(t("errors.VALIDATION_FAILED"));
      return;
    }
    setSaving(true);
    try {
      const saved = entry ? await updateEntry(entry.id, validated.value) : await createEntry(validated.value);
      onSaved(saved);
    } catch (err) {
      if (err instanceof AppError && err.fields) setFieldErrors(err.fields);
      setError(err instanceof AppError ? t("errors." + err.code) : t("errors.INTERNAL_ERROR"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{entry ? t("common.edit") : t("journal.new")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entryTitle">{t("journal.titleField")}</Label>
            <Input
              id="entryTitle"
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              maxLength={TITLE_MAX_LENGTH}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryPrompt">{t("journal.promptLabel")}</Label>
            <select
              id="entryPrompt"
              value={values.promptType}
              onChange={(e) => setField("promptType", e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground"
            >
              <option value="">{t("journal.promptNone")}</option>
              {PROMPT_TYPES.map((code) => (
                <option key={code} value={code}>
                  {t("journal.prompts." + code)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entryBody">{t("journal.bodyField")}</Label>
            <Textarea
              id="entryBody"
              value={values.body}
              onChange={(e) => setField("body", e.target.value)}
              maxLength={BODY_MAX_LENGTH}
              rows={7}
              aria-invalid={!!fieldErrors.body}
            />
            <p className="text-right text-xs text-muted-foreground">
              {values.body.length}/{BODY_MAX_LENGTH}
            </p>
            {fieldErrors.body && <p className="text-xs text-destructive">{t("journal.bodyRequired")}</p>}
          </div>

          <div>
            <ScaleSelector
              label={t("journal.moodLabel")}
              name="moodScore"
              value={values.moodScore}
              onChange={(score) => setField("moodScore", values.moodScore === score ? null : score)}
              labels={[1, 2, 3, 4, 5].map((n) => t("checkin.scale.mood." + n))}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {saving ? t("journal.saving") : t("journal.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}