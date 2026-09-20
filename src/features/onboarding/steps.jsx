import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { GOAL_CODES, MAX_GOALS } from "@/domain/validation/profile";
import { getSupportedLanguages } from "@/i18n";

function StepCard({ title, body, children }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
        {body && <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>}
      </div>
      {children}
    </div>
  );
}

export function WelcomeStep({ t }) {
  return (
    <StepCard title={t("onboarding.s1.title")} body={t("onboarding.s1.body")}>
      <SafetyDisclaimer />
    </StepCard>
  );
}

export function BoundaryStep({ t, adultConfirmed, agreed, onAdultChange, onAgreeChange }) {
  return (
    <StepCard title={t("onboarding.s2.title")} body={t("onboarding.s2.body")}>
      <div className="space-y-4">
        <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <Checkbox
            checked={adultConfirmed}
            onCheckedChange={(checked) => onAdultChange(checked === true)}
            aria-label={t("onboarding.s2.adult")}
          />
          <span className="text-sm leading-relaxed">{t("onboarding.s2.adult")}</span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <Checkbox
            checked={agreed}
            onCheckedChange={(checked) => onAgreeChange(checked === true)}
            aria-label={t("onboarding.s2.terms")}
          />
          <span className="text-sm leading-relaxed">{t("onboarding.s2.terms")}</span>
        </label>
      </div>
      <SafetyDisclaimer />
    </StepCard>
  );
}

export function NameStep({ t, value, onChange, error }) {
  return (
    <StepCard title={t("onboarding.s3.title")} body={t("onboarding.s3.body")}>
      <div className="space-y-2">
        <Label htmlFor="displayName">{t("onboarding.s3.label")}</Label>
        <Input
          id="displayName"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={80}
          placeholder={t("onboarding.s3.placeholder")}
          autoFocus
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {t("onboarding.s3.error")}
          </p>
        )}
        <p className="text-xs text-muted-foreground">{t("onboarding.s3.hint")}</p>
      </div>
    </StepCard>
  );
}

export function TimezoneStep({ t, value, onChange, options }) {
  return (
    <StepCard title={t("onboarding.s4.title")} body={t("onboarding.s4.body")}>
      <div className="space-y-2">
        <Label htmlFor="timezone">{t("onboarding.s4.label")}</Label>
        <select
          id="timezone"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {options.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>
    </StepCard>
  );
}

export function LanguageStep({ t, value, onSelect }) {
  return (
    <StepCard title={t("onboarding.s5.title")} body={t("onboarding.s5.body")}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {getSupportedLanguages().map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onSelect(code)}
            aria-pressed={value === code}
            className={cn(
              "flex items-center justify-between rounded-2xl border p-4 text-left transition-colors",
              value === code
                ? "border-primary bg-secondary"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            <span className="font-medium">{t("languageName." + code)}</span>
            {value === code && <Check className="h-5 w-5 text-primary" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </StepCard>
  );
}

export function GoalsStep({ t, selected, onToggle }) {
  const limitReached = selected.length >= MAX_GOALS;
  return (
    <StepCard title={t("onboarding.s6.title")} body={t("onboarding.s6.body")}>
      <div className="flex flex-wrap gap-2">
        {GOAL_CODES.map((code) => {
          const isSelected = selected.includes(code);
          const disabled = !isSelected && limitReached;
          return (
            <button
              key={code}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(code)}
              aria-pressed={isSelected}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40",
                disabled && "cursor-not-allowed opacity-40"
              )}
            >
              {t("goals." + code)}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("onboarding.s6.hint", { count: selected.length, max: MAX_GOALS })}
      </p>
    </StepCard>
  );
}

export function RemindersStep({ t, value, onChange }) {
  return (
    <StepCard title={t("onboarding.s7.title")} body={t("onboarding.s7.body")}>
      <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
        <span className="text-sm font-medium">{t("onboarding.s7.toggle")}</span>
        <Switch checked={value} onCheckedChange={(checked) => onChange(checked === true)} aria-label={t("onboarding.s7.toggle")} />
      </label>
      <p className="text-xs text-muted-foreground">{t("onboarding.s7.hint")}</p>
    </StepCard>
  );
}

export function ConfirmStep({ t, state }) {
  const rows = [
    { label: t("onboarding.s8.name"), value: state.displayName },
    { label: t("onboarding.s8.timezone"), value: state.timezone },
    { label: t("onboarding.s8.language"), value: t("languageName." + state.language) },
    {
      label: t("onboarding.s8.goals"),
      value:
        state.goals.length > 0
          ? state.goals.map((code) => t("goals." + code)).join(", ")
          : t("onboarding.s8.none")
    }
  ];
  return (
    <StepCard title={t("onboarding.s8.title")} body={t("onboarding.s8.body")}>
      <dl className="space-y-3 rounded-2xl border border-border bg-card p-5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="font-medium text-muted-foreground">{row.label}</dt>
            <dd className="text-right text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </StepCard>
  );
}