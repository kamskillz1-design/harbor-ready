import React, { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PageLoader from "@/components/PageLoader";
import ErrorState from "@/components/ErrorState";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { useI18n } from "@/i18n/useI18n";
import { setAppLanguage } from "@/i18n";
import { getMyProfile, updatePreferences } from "@/app/services/profileService";
import { getTimezoneOptions } from "@/domain/profile/timezones";
import { getSupportedLanguages } from "@/i18n";
import { signOut } from "@/adapters/base44/auth";
import { AppError } from "@/domain/errors";
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
import { useNavigate } from "react-router-dom";
import { exportMyData, deleteMyData } from "@/app/services/privacyService";

export default function Settings() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(undefined);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dataError, setDataError] = useState("");
  const [form, setForm] = useState(null);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((loaded) => {
        if (!active) return;
        setProfile(loaded);
        setForm({
          displayName: loaded.displayName,
          timezone: loaded.timezone,
          language: loaded.language,
          reminderEnabled: loaded.reminderEnabled
        });
        if (loaded.language) setAppLanguage(loaded.language);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("settings.title")}</h1>
        <ErrorState onRetry={() => window.location.reload()} />
      </div>
    );
  }
  if (!profile || !form) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("settings.title")}</h1>
        <PageLoader />
      </div>
    );
  }

  const setField = (field, value) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(form);
      setAppLanguage(form.language);
      setSaved(true);
    } catch (err) {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  const timezoneOptions = getTimezoneOptions(form.timezone);

  const messageFor = (err) => t("errors." + (err instanceof AppError ? err.code : "INTERNAL_ERROR"));

  const handleExport = async () => {
    setExporting(true);
    setDataError("");
    try {
      await exportMyData();
    } catch (err) {
      setDataError(messageFor(err));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDataError("");
    try {
      await deleteMyData();
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setDataError(messageFor(err));
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">{t("settings.title")}</h1>

      <section className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-foreground">{t("settings.profileSection")}</h2>

        <div className="space-y-2">
          <Label htmlFor="settingsName">{t("settings.displayName")}</Label>
          <Input
            id="settingsName"
            value={form.displayName}
            onChange={(e) => setField("displayName", e.target.value)}
            maxLength={80}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settingsLanguage">{t("settings.languageLabel")}</Label>
          <select
            id="settingsLanguage"
            value={form.language}
            onChange={(e) => setField("language", e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground"
          >
            {getSupportedLanguages().map((code) => (
              <option key={code} value={code}>
                {t("languageName." + code)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settingsTimezone">{t("settings.timezoneLabel")}</Label>
          <select
            id="settingsTimezone"
            value={form.timezone}
            onChange={(e) => setField("timezone", e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground"
          >
            {timezoneOptions.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4">
          <span className="text-sm font-medium">{t("settings.reminderToggle")}</span>
          <Switch
            checked={form.reminderEnabled}
            onCheckedChange={(checked) => setField("reminderEnabled", checked === true)}
            aria-label={t("settings.reminderToggle")}
          />
        </label>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {saving ? t("settings.saving") : t("settings.save")}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Check className="h-4 w-4" aria-hidden="true" />
              {t("settings.saved")}
            </span>
          )}
        </div>
      </section>

      <section className="space-y-3 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-foreground">{t("settings.safetySection")}</h2>
        <SafetyDisclaimer />
      </section>

      <section className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-foreground">{t("settings.dataSection")}</h2>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("settings.exportDesc")}</p>
          <Button variant="outline" onClick={handleExport} disabled={exporting || deleting} className="self-start">
            {exporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {exporting ? t("settings.exporting") : t("settings.exportButton")}
          </Button>
        </div>

        <div className="space-y-3 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">{t("settings.deleteDesc")}</p>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={exporting || deleting} className="self-start">
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {deleting ? t("settings.deleting") : t("settings.deleteButton")}
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("settings.deleteTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{t("settings.deleteBody")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? t("settings.deleting") : t("settings.deleteConfirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {dataError && (
          <p className="text-sm text-destructive" role="alert">
            {dataError}
          </p>
        )}
      </section>

      <Button variant="outline" onClick={() => signOut()}>
        {t("common.signOut")}
      </Button>
    </div>
  );
}