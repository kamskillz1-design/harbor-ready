import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, HeartHandshake, Phone } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/useI18n";
import { REGION_CODES, getRegionConfig } from "@/domain/safety/regions";

export default function HelpNow() {
  const { t } = useI18n();
  const [region, setRegion] = useState("OTHER");
  const [showTrusted, setShowTrusted] = useState(false);
  const config = getRegionConfig(region);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("common.back")}
        </Link>

        <h1 className="mt-6 font-display text-3xl font-semibold text-foreground">{t("helpnow.title")}</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">{t("helpnow.lead")}</p>

        <div className="mt-6">
          <SafetyDisclaimer />
        </div>

        <div className="mt-8 space-y-2">
          <Label htmlFor="region">{t("helpnow.countryLabel")}</Label>
          <select
            id="region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {REGION_CODES.map((code) => (
              <option key={code} value={code}>
                {t("helpnow.country." + code)}
              </option>
            ))}
          </select>
        </div>

        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm" aria-live="polite">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t("helpnow.guidanceTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("helpnow.guidance." + region)}
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {config.emergencyNumber && (
              <a
                href={"tel:" + config.emergencyNumber}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {t("helpnow.callEmergency", { number: config.emergencyNumber })}
              </a>
            )}
            <Button
              variant="outline"
              className="justify-center"
              onClick={() => setShowTrusted((current) => !current)}
              aria-expanded={showTrusted}
            >
              <HeartHandshake className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("helpnow.trusted")}
            </Button>
            {showTrusted && (
              <p className="rounded-2xl bg-secondary/60 p-4 text-sm leading-relaxed text-muted-foreground">
                {t("helpnow.trustedHint")}
              </p>
            )}
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {t("helpnow.return")}
            </Link>
          </div>
        </section>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{t("helpnow.note")}</p>
      </main>
    </div>
  );
}