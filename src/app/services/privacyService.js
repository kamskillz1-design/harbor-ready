import { supabase } from "@/api/supabaseClient";
import { AppError, ErrorCodes } from "@/domain/errors";
import { requireUserId } from "@/api/currentUser";

export async function exportMyData() {
  try {
    const userId = await requireUserId();
    const [
      profile,
      checkIns,
      journalEntries,
      goals,
      exerciseSessions,
      thoughtRecords,
      companionMessages,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("mood_check_ins").select("*").eq("user_id", userId).order("local_date", { ascending: false }).limit(500),
      supabase.from("journal_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
      supabase.from("wellness_goals").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
      supabase.from("exercise_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
      supabase.from("thought_records").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
      supabase.from("companion_messages").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
    ]);
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: profile.data || null,
      checkIns: checkIns.data || [],
      journalEntries: journalEntries.data || [],
      goals: goals.data || [],
      exerciseSessions: exerciseSessions.data || [],
      thoughtRecords: thoughtRecords.data || [],
      companionMessages: companionMessages.data || [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "harbor-export-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return payload;
  } catch (e) {
    throw new AppError(ErrorCodes.EXPORT_UNAVAILABLE);
  }
}

export async function deleteMyData() {
  try {
    const userId = await requireUserId();
    const tables = [
      "mood_check_ins",
      "journal_entries",
      "wellness_goals",
      "exercise_sessions",
      "thought_records",
      "companion_messages",
      "consent_records",
    ];
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq("user_id", userId);
      if (error) throw error;
    }
    await supabase
      .from("profiles")
      .update({
        display_name: null,
        timezone: null,
        language: "es",
        goals: [],
        reminder_enabled: false,
        onboarding_completed_at: null,
      })
      .eq("id", userId);
    return { deleted: true };
  } catch (e) {
    throw new AppError(ErrorCodes.DELETION_UNAVAILABLE);
  }
}
