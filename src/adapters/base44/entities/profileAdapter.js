import { supabase } from "@/api/supabaseClient";
import { requireUserId } from "@/api/currentUser";

export function mapProfile(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    userId: raw.id,
    displayName: raw.display_name,
    timezone: raw.timezone,
    language: raw.language,
    goals: raw.goals || [],
    reminderEnabled: raw.reminder_enabled === true,
    onboardingCompletedAt: raw.onboarding_completed_at || null,
    createdAt: raw.created_at || null,
  };
}

export async function getMyProfile() {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return data ? mapProfile(data) : null;
}
