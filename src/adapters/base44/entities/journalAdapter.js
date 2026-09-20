import { supabase } from "@/api/supabaseClient";
import { requireUserId } from "@/api/currentUser";

export function mapEntry(raw) {
  return {
    id: raw.id,
    title: raw.title || null,
    body: raw.body,
    promptType: raw.prompt_type || null,
    moodScore: raw.mood_score ?? null,
    createdAt: raw.created_at || null,
    updatedAt: raw.updated_at || null,
  };
}

export async function listJournalEntries(limit) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit || 20);
  if (error) throw error;
  return (data || []).map(mapEntry);
}

export async function createJournalRecord(fields) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: userId,
      title: fields.title || null,
      body: fields.body,
      prompt_type: fields.promptType || null,
      mood_score: fields.moodScore ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapEntry(data);
}

export async function updateJournalRecord(id, fields) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("journal_entries")
    .update({
      title: fields.title || null,
      body: fields.body,
      prompt_type: fields.promptType || null,
      mood_score: fields.moodScore ?? null,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return mapEntry(data);
}

export async function deleteJournalRecord(id) {
  const userId = await requireUserId();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}
