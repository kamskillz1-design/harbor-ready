import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getMyProfile } from "@/app/services/profileService";
import PageLoader from "@/components/PageLoader";

// Gate for screens that require a completed onboarding. Fails closed.
export default function RequireOnboarding() {
  const [state, setState] = useState("loading");

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((profile) => {
        if (active) setState(profile && profile.onboardingCompletedAt ? "ready" : "required");
      })
      .catch(() => {
        if (active) setState("required");
      });
    return () => {
      active = false;
    };
  }, []);

  if (state === "loading") return <PageLoader />;
  if (state === "required") return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}