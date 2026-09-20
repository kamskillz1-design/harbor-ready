import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/useI18n";
import { GOAL_CODES } from "@/domain/validation/profile";
import { validateGoalForm } from "@/domain/validation/goal";

export default function GoalForm({ onCreate, onCancel, creating }) {
  const { t } = useI18n();
  const [values, setValues] = useState({ category: GOAL_CODES[0], title: "", weeklyTarget: "" });
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const validated = validateGoalForm({
      category: values.category,
      title: values.title,
      weeklyTarget: values.weeklyTarget === "" ? null : Number(values.weeklyTarget)
    });
    if (!validated.valid) {
      setErrors(validated.errors);
      return;
    }
    setErrors({});
    onCreate(validated.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="goalCategory">{t("plan.categoryLabel")}</Label>
        <select
          id="goalCategory"
          value={values.category}
          onChange={(e) => setValues((current) => ({ ...current, category: e.target.value }))}
          className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground"
        >
          {GOAL_CODES.map((code) => (
            <option key={code} value={code}>
              {t("goals." + code)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="goalTitle">{t("plan.titleLabel")}</Label>
        <Input
          id="goalTitle"
          value={values.title}
          onChange={(e) => setValues((current) => ({ ...current, title: e.target.value }))}
          maxLength={120}
          placeholder={t("plan.titlePlaceholder")}
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className="text-xs text-destructive">{t("errors.VALIDATION_FAILED")}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="goalTarget">{t("plan.targetLabel")}</Label>
        <select
          id="goalTarget"
          value={values.weeklyTarget}
          onChange={(e) => setValues((current) => ({ ...current, weeklyTarget: e.target.value }))}
          className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground"
        >
          <option value="">{t("plan.targetNone")}</option>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={creating}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={creating}>
          {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {creating ? t("plan.creating") : t("plan.create")}
        </Button>
      </div>
    </form>
  );
}