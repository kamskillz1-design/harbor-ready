import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { supabase } from "@/api/supabaseClient";
import { getCurrentUser, mergeUser, signOut as adapterSignOut } from "@/adapters/base44/auth";
import { isSupportedLanguage, setAppLanguage } from "@/i18n";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: "harbor",
    public_settings: {},
  });

  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        setAuthError(null);
        if (currentUser.language && isSupportedLanguage(currentUser.language)) {
          setAppLanguage(currentUser.language);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setAuthChecked(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error("User auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  const checkAppState = useCallback(async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      setAppPublicSettings({ id: "harbor", public_settings: {} });
      setIsLoadingPublicSettings(false);
      await checkUserAuth();
    } catch (error) {
      console.error("Unexpected error:", error);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [checkUserAuth]);

  useEffect(() => {
    checkAppState();
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
        setIsLoadingAuth(false);
        return;
      }
      if (!session?.user) {
        setAuthChecked(true);
        setIsLoadingAuth(false);
        return;
      }
      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        const merged = await mergeUser(session.user);
        setUser(merged);
        setIsAuthenticated(!!merged);
        setAuthError(null);
        if (merged?.language && isSupportedLanguage(merged.language)) {
          setAppLanguage(merged.language);
        }
        setAuthChecked(true);
        setIsLoadingAuth(false);
      }
    });
    return () => {
      data?.subscription?.unsubscribe?.();
    };
  }, [checkAppState]);

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      adapterSignOut();
    } else {
      supabase.auth.signOut();
    }
  };

  const navigateToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
