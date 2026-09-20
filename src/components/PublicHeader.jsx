import React from "react";
import { Link } from "react-router-dom";
import { Anchor, LifeBuoy, LogIn } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import { useAuth } from "@/lib/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function PublicHeader() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  return (
    <header className="border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
          <Anchor className="h-5 w-5 text-primary" aria-hidden="true" />
          Harbor
        </Link>
        <nav className="flex items-center gap-3 text-sm" aria-label={t("common.primaryNav")}>
          <Link
            to="/help-now"
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <LifeBuoy className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("common.helpNow")}</span>
          </Link>
          <LanguageSwitcher />
          {isAuthenticated ? (
            <Link
              to="/today"
              className="rounded-full bg-primary px-4 py-1.5 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("common.openApp")}
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {t("common.signIn")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}