import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Sun, Wind } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { useI18n } from "@/i18n/useI18n";

export default function Home() {
  const { t } = useI18n();
  const features = [
    { icon: Sun, title: t("landing.feature1.title"), body: t("landing.feature1.body") },
    { icon: BookOpen, title: t("landing.feature2.title"), body: t("landing.feature2.body") },
    { icon: Wind, title: t("landing.feature3.title"), body: t("landing.feature3.body") }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-6 pb-16">
        <section className="py-14 sm:py-20">
          <div className="max-w-2xl space-y-5">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              {t("landing.kicker")}
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              {t("landing.headline")}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">{t("landing.sub")}</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t("landing.ctaSignUp")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {t("common.signIn")}
              </Link>
            </div>
          </div>
          <div className="mt-10 max-w-2xl">
            <SafetyDisclaimer />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label={t("landing.featuresLabel")}>
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 font-display text-lg font-semibold text-foreground">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </section>

        <footer className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>{t("landing.privacyNote")}</p>
          <p className="mt-2">
            <Link to="/help-now" className="text-primary hover:underline">
              {t("common.helpNow")}
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}