import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/useI18n";
import { getAppLanguage, setAppLanguage } from "@/i18n";
import PageLoader from "@/components/PageLoader";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { completeOnboarding, getMyProfile } from "@/app/services/profileService";
import { AppError } from "@/domain/errors";
import { validateDisplayName, validateTimezone } from "@/domain/validation/profile";
import { detectTimezone, getTimezoneOptions } from "@/domain/profile/timezones";
import {
  WelcomeStep,
  BoundaryStep,
  NameStep,
  TimezoneStep,
  LanguageStep,
  GoalsStep,
  RemindersStep,
  ConfirmStep
} from "@/features/onboarding/steps";

const TOTAL_STEPS = 8;

export default function Onboarding() {
  const { t, language: uiLanguage } = useI18n();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [timezone, setTimezone] = useState(detectTimezone());
  const [language, setLanguage] = useState(getAppLanguage());
  const [goals, setGoals] = useState([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (uiLanguage && uiLanguage !== language) {
      setLanguage(uiLanguage);
    }
  }, [uiLanguage]);

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((profile) => {
        if (active && profile && profile.onboardingCompletedAt) navigate("/today", { replace: true });
        else if (active) setChecking(false);
      })
      .catch(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  const timezoneOptions = useMemo(() => getTimezoneOptions(timezone), [timezone]);

  if (checking) return <PageLoader />;

  const state = {
    displayName: displayName,
    timezone: timezone,
    language: language,
    goals: goals,
    reminderEnabled: reminderEnabled
  };

  const selectLanguage = (code) => {
    setLanguage(code);
    setAppLanguage(code);
  };

  const toggleGoal = (code) => {
    setGoals((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code]
    );
  };

  const finish = async () => {
    setError("");
    setSubmitting(true);
    try {
      setAppLanguage(language);
      await completeOnboarding(state);
      navigate("/today", { replace: true });
    } catch (err) {
      setError(err instanceof AppError ? t("errors." + err.code) : t("errors.INTERNAL_ERROR"));
      setSubmitting(false);
    }
  };

  const goNext = () => {
    setError("");
    if (step === 1 && (!adultConfirmed || !agreed)) {
      setError(t("onboarding.s2.required"));
      return;
    }
    if (step === 2) {
      if (!validateDisplayName(displayName)) {
        setNameError(true);
        return;
      }
      setNameError(false);
    }
    if (step === 3 && !validateTimezone(timezone)) {
      setError(t("errors.VALIDATION_FAILED"));
      return;
    }
    if (step === TOTAL_STEPS - 1) {
      finish();
      return;
    }
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  };

  const steps = [
    <WelcomeStep key="s1" t={t} />,
    <BoundaryStep
      key="s2"
      t={t}
      adultConfirmed={adultConfirmed}
      agreed={agreed}
      onAdultChange={setAdultConfirmed}
      onAgreeChange={setAgreed}
    />,
    <NameStep key="s3" t={t} value={displayName} onChange={setDisplayName} error={nameError} />,
    <TimezoneStep key="s4" t={t} value={timezone} onChange={setTimezone} options={timezoneOptions} />,
    <LanguageStep key="s5" t={t} value={language} onSelect={selectLanguage} />,
    <GoalsStep key="s6" t={t} selected={goals} onToggle={toggleGoal} />,
    <RemindersStep key="s7" t={t} value={reminderEnabled} onChange={setReminderEnabled} />,
    <ConfirmStep key="s8" t={t} state={state} />
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-4 flex items-center justify-end">
          <LanguageSwitcher />
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("onboarding.stepOf", { current: step + 1, total: TOTAL_STEPS })}
        </p>
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: ((step + 1) / TOTAL_STEPS) * 100 + "%" }}
          />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {steps[step]}
          {error && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              disabled={step === 0 || submitting}
            >
              <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
              {t("common.back")}
            </Button>
            <Button onClick={goNext} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {t("onboarding.finishing")}
                </>
              ) : step === TOTAL_STEPS - 1 ? (
                t("onboarding.finish")
              ) : (
                <>
                  {t("common.next")}
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
