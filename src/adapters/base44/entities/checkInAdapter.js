import { supabase } from "@/api/supabaseClient";
import { requireUserId } from "@/api/currentUser";

export function mapCheckIn(raw) {
  return {
    id: raw.id,
    userId: raw.user_id,
    localDate: raw.local_date,
    moodScore: raw.mood_score,
    stressScore: raw.stress_score,
    energyScore: raw.energy_score,
    sleepScore: raw.sleep_score,
    emotionTags: raw.emotion_tags || [],
    note: raw.note || null,
    checkedInAt: raw.checked_in_at || null,
    createdAt: raw.created_at || null,
    updatedAt: raw.updated_at || null,
  };
}

export async function getCheckInByLocalDate(localDate) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("mood_check_ins")
    .select("*")
    .eq("user_id", userId)
    .eq("local_date", localDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCheckIn(data) : null;
}

export async function listRecentCheckIns(limit) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("mood_check_ins")
    .select("*")
    .eq("user_id", userId)
    .order("local_date", { ascending: false })
    .limit(limit || 30);
  if (error) throw error;
  return (data || []).map(mapCheckIn);
}

export async function upsertCheckIn(fields) {
  const userId = await requireUserId();
  const row = {
    user_id: userId,
    local_date: fields.localDate,
    checked_in_at: fields.checkedInAt,
    mood_score: fields.moodScore,
    stress_score: fields.stressScore,
    energy_score: fields.energyScore,
    sleep_score: fields.sleepScore,
    emotion_tags: fields.emotionTags || [],
    note: fields.note || null,
  };
  const { data, error } = await supabase
    .from("mood_check_ins")
    .upsert(row, { onConflict: "user_id,local_date" })
    .select()
    .single();
  if (error) throw error;
  return mapCheckIn(data);
}
