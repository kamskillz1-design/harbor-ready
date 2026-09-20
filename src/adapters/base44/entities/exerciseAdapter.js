import { supabase } from "@/api/supabaseClient";
import { requireUserId } from "@/api/currentUser";

export function mapTemplate(raw) {
  return {
    id: raw.id,
    slug: raw.slug,
    category: raw.category,
    titleKey: raw.title_key,
    descriptionKey: raw.description_key,
    active: raw.active === true,
  };
}

export function mapSession(raw) {
  return {
    id: raw.id,
    exerciseSlug: raw.exercise_slug,
    startedAt: raw.started_at || null,
    completedAt: raw.completed_at || null,
    durationSeconds: raw.duration_seconds ?? null,
    reflection: raw.reflection || null,
    helpfulnessScore: raw.helpfulness_score ?? null,
    actionText: raw.action_text || null,
    createdAt: raw.created_at || null,
  };
}

export function mapThoughtRecord(raw) {
  return {
    id: raw.id,
    exerciseSessionId: raw.exercise_session_id,
    situation: raw.situation,
    automaticThought: raw.automatic_thought,
    emotions: raw.emotions || [],
    evidenceFor: raw.evidence_for || null,
    evidenceAgainst: raw.evidence_against || null,
    balancedThought: raw.balanced_thought,
    actionPlan: raw.action_plan || null,
    completedAt: raw.completed_at || null,
    createdAt: raw.created_at || null,
  };
}

export async function listTemplates() {
  const { data, error } = await supabase
    .from("exercise_templates")
    .select("*")
    .eq("active", true);
  if (error) throw error;
  return (data || []).map(mapTemplate);
}

export async function listSessions(limit) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("exercise_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit || 10);
  if (error) throw error;
  return (data || []).map(mapSession);
}

export async function deleteSession(id) {
  const userId = await requireUserId();
  const { error } = await supabase
    .from("exercise_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function createSessionRecord(fields) {
  const userId = await requireUserId();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("exercise_sessions")
    .insert({
      user_id: userId,
      exercise_slug: fields.exerciseSlug,
      started_at: now,
      completed_at: now,
      duration_seconds: fields.durationSeconds ?? null,
      reflection: fields.reflection || null,
      helpfulness_score: fields.helpfulnessScore ?? null,
      action_text: fields.actionText || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapSession(data);
}

export async function createThoughtRecord(sessionId, tr) {
  const userId = await requireUserId();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("thought_records")
    .insert({
      user_id: userId,
      exercise_session_id: sessionId,
      situation: tr.situation,
      automatic_thought: tr.automaticThought,
      emotions: tr.emotions || [],
      evidence_for: tr.evidenceFor || null,
      evidence_against: tr.evidenceAgainst || null,
      balanced_thought: tr.balancedThought,
      action_plan: tr.actionPlan || null,
      completed_at: now,
    })
    .select()
    .single();
  if (error) throw error;
  return mapThoughtRecord(data);
}
