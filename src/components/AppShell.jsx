import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Anchor, LifeBuoy, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/useI18n";
import { signOut } from "@/adapters/base44/auth";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AppShell() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link to="/today" className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Anchor className="h-5 w-5 text-primary" aria-hidden="true" />
              Harbor
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto text-sm" aria-label={t("common.primaryNav")}>
              {[
                { to: "/today", key: "nav.today" },
                { to: "/journal", key: "nav.journal" },
                { to: "/toolkit", key: "nav.toolkit" },
                { to: "/companion", key: "nav.companion" },
                { to: "/insights", key: "nav.insights" },
                { to: "/plan", key: "nav.plan" },
                { to: "/settings", key: "nav.settings" }
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/help-now"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("common.helpNow")}</span>
            </Link>
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("common.signOut")}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
