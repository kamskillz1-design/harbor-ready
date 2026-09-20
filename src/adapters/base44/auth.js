// Auth boundary — Supabase Auth. Import paths stay the same for AppShell/Settings.
import { supabase } from "@/api/supabaseClient";

export function authRedirectBase() {
  if (typeof window === "undefined") return "http://localhost:5173";
  return window.location.origin;
}

export async function mergeUser(authUser) {
  if (!authUser) return null;
  let profile = null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();
    if (!error) profile = data;
  } catch (e) {
    profile = null;
  }
  return {
    id: authUser.id,
    email: authUser.email,
    role: profile?.role || "user",
    displayName: profile?.display_name || null,
    timezone: profile?.timezone || null,
    language: profile?.language || null,
    goals: profile?.goals || [],
    reminderEnabled: profile?.reminder_enabled === true,
    onboardingCompletedAt: profile?.onboarding_completed_at || null,
    profile: profile || null,
  };
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return mergeUser(data.user);
  } catch (e) {
    return null;
  }
}

export async function hasRole(role) {
  const user = await getCurrentUser();
  return !!user && user.role === role;
}

export async function signOut() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    // still leave the app
  }
  window.location.href = "/login";
}

export async function loginViaEmailPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function register({ email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authRedirectBase() + "/today",
    },
  });
  if (error) throw error;
  return data;
}

export async function verifyOtp({ email, otpCode }) {
  let lastError = null;
  for (const type of ["signup", "email"]) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type,
    });
    if (!error) return data;
    lastError = error;
  }
  throw lastError;
}

export async function resendOtp(email) {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
}

export async function loginWithGoogle(returnTo) {
  const redirectTo =
    authRedirectBase() + (returnTo && returnTo.startsWith("/") ? returnTo : "/today");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function resetPasswordRequest(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authRedirectBase() + "/reset-password",
  });
  if (error) throw error;
}

export async function resetPassword({ resetToken, email, newPassword }) {
  if (resetToken) {
    const payload = { token: resetToken, type: "recovery" };
    if (email) payload.email = email;
    await supabase.auth.verifyOtp(payload);
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
