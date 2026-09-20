import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageLoader from "@/components/PageLoader";
import ErrorState from "@/components/ErrorState";
import TrendChart from "@/features/insights/TrendChart";
import { useI18n } from "@/i18n/useI18n";
import { getRecentCheckIns } from "@/app/services/checkInService";

export default function Insights() {
  const { t } = useI18n();
  const [checkIns, setCheckIns] = useState(undefined);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      setCheckIns(await getRecentCheckIns(60));
    } catch (e) {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { chartData, stats } = useMemo(() => {
    const sorted = [...(checkIns || [])].sort((a, b) =>
      String(a.localDate).localeCompare(String(b.localDate))
    );
    const chartData = sorted.slice(-30).map((checkIn) => ({
      date: String(checkIn.localDate).slice(5),
      mood: checkIn.moodScore,
      stress: checkIn.stressScore,
      energy: checkIn.energyScore,
      sleep: checkIn.sleepScore
    }));
    const recent = sorted.slice(-7);
    const avgMood =
      recent.length > 0
        ? (recent.reduce((sum, item) => sum + item.moodScore, 0) / recent.length).toFixed(1)
        : null;
    const counts = {};
    (checkIns || []).forEach((checkIn) => {
      (checkIn.emotionTags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return {
      chartData,
      stats: {
        total: (checkIns || []).length,
        avgMood: avgMood,
        topTag: topEntry ? topEntry[0] : null
      }
    };
  }, [checkIns]);

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("insights.title")}</h1>
        <ErrorState onRetry={load} />
      </div>
    );
  }
  if (checkIns === undefined) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">{t("insights.title")}</h1>
        <PageLoader />
      </div>
    );
  }

  const cards = [
    { label: t("insights.statTotal"), value: String(stats.total) },
    { label: t("insights.statAvgMood"), value: stats.avgMood !== null ? stats.avgMood : t("insights.statNone") },
    {
      label: t("insights.statTopFeeling"),
      value: stats.topTag ? t("checkin.tags." + stats.topTag) : t("insights.statNone")
    }
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t("insights.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("insights.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-foreground">{t("insights.chartTitle")}</h2>
        {chartData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-display text-lg font-semibold text-foreground">{t("insights.emptyTitle")}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t("insights.emptyBody")}</p>
          </div>
        ) : (
          <TrendChart
            data={chartData}
            labels={{
              mood: t("today.mood"),
              stress: t("today.stress"),
              energy: t("today.energy"),
              sleep: t("today.sleep")
            }}
          />
        )}
      </section>
    </div>
  );
}