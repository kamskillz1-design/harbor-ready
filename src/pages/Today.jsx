import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import PageLoader from "@/components/PageLoader";
import ErrorState from "@/components/ErrorState";
import CheckInForm from "@/features/checkins/CheckInForm";
import CheckInSummary from "@/features/checkins/CheckInSummary";
import { getMyProfile } from "@/app/services/profileService";
import {
  getRecentCheckIns,
  getTodayCheckIn,
  weekAgoLocal
} from "@/app/services/checkInService";

function greetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return "today.greetingMorning";
  if (hour < 18) return "today.greetingAfternoon";
  return "today.greetingEvening";
}

export default function Today() {
  const { t } = useI18n();
  const [profile, setProfile] = useState(null);
  const [checkIn, setCheckIn] = useState(undefined);
  const [recentCount, setRecentCount] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const loadedProfile = await getMyProfile();
      setProfile(loadedProfile);
      const [today, recent] = await Promise.all([
        getTodayCheckIn(loadedProfile.timezone),
        getRecentCheckIns(30)
      ]);
      setCheckIn(today);
      const cutoff = weekAgoLocal(loadedProfile.timezone);
      setRecentCount(recent.filter((item) => item.localDate >= cutoff).length);
    } catch (e) {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loadError) {
    return <ErrorState onRetry={load} />;
  }
  if (!profile || checkIn === undefined) {
    return <PageLoader />;
  }

  const showForm = !checkIn || editing;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">{t(greetingKey())}</p>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          {t("today.greeting", { name: profile.displayName })}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-5 font-display text-xl font-semibold text-foreground">
            {checkIn && !editing ? t("today.checkinDone") : t("today.checkinTitle")}
          </h2>
          {showForm ? (
            <CheckInForm
              initial={checkIn}
              onSaved={(saved) => {
                setCheckIn(saved);
                setEditing(false);
                load();
              }}
            />
          ) : (
            <CheckInSummary checkIn={checkIn} onEdit={() => setEditing(true)} />
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t("today.recentTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {recentCount > 0
                ? t("today.recentCount", { count: recentCount })
                : t("today.recentEmpty")}
            </p>
          </section>

          <section className="rounded-3xl border border-border bg-secondary/60 p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t("today.helpTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("today.helpBody")}</p>
            <Link
              to="/help-now"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
            >
              <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              {t("common.helpNow")}
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}