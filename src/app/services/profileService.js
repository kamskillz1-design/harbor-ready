import { supabase } from "@/api/supabaseClient";
import { AppError, ErrorCodes } from "@/domain/errors";
import { getMyProfile, mapProfile } from "@/adapters/base44/entities/profileAdapter";
import { requireUserId } from "@/api/currentUser";

export { getMyProfile };

const CONSENT_POLICY_VERSION = "1.0";

export async function completeOnboarding(input) {
  try {
    const userId = await requireUserId();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        display_name: input.displayName,
        timezone: input.timezone,
        language: input.language,
        goals: input.goals || [],
        reminder_enabled: input.reminderEnabled === true,
        onboarding_completed_at: now,
      })
      .select()
      .single();
    if (error) throw error;

    const { data: existingConsent } = await supabase
      .from("consent_records")
      .select("id")
      .eq("user_id", userId)
      .eq("policy_version", CONSENT_POLICY_VERSION)
      .maybeSingle();
    if (!existingConsent) {
      await supabase.from("consent_records").insert({
        user_id: userId,
        policy_version: CONSENT_POLICY_VERSION,
        consented_at: now,
      });
    }
    return mapProfile(data);
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(ErrorCodes.DEPENDENCY_UNAVAILABLE);
  }
}

export async function updatePreferences(input) {
  try {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        display_name: input.displayName,
        timezone: input.timezone,
        language: input.language,
        reminder_enabled: input.reminderEnabled === true,
      })
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return mapProfile(data);
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(ErrorCodes.DEPENDENCY_UNAVAILABLE);
  }
}
