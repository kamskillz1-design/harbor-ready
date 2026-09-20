import { supabase } from "@/api/supabaseClient";
import { requireUserId } from "@/api/currentUser";

export function mapGoal(raw) {
  return {
    id: raw.id,
    category: raw.category,
    title: raw.title,
    weeklyTarget: raw.weekly_target ?? null,
    status: raw.status,
    completionsCount: raw.completions_count || 0,
    weekStartDate: raw.week_start_date || null,
    lastCompletionAt: raw.last_completion_at || null,
    startedAt: raw.started_at || null,
    completedAt: raw.completed_at || null,
    createdAt: raw.created_at || null,
  };
}

export async function listAllGoals() {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("wellness_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map(mapGoal);
}

export async function createGoalRecord(data) {
  const userId = await requireUserId();
  const { data: row, error } = await supabase
    .from("wellness_goals")
    .insert({
      user_id: userId,
      category: data.category,
      title: data.title,
      weekly_target: data.weeklyTarget ?? null,
      status: data.status || "active",
      completions_count: data.completionsCount || 0,
      week_start_date: data.weekStartDate || null,
      last_completion_at: data.lastCompletionAt || null,
      started_at: data.startedAt || new Date().toISOString(),
      completed_at: data.completedAt || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapGoal(row);
}

export async function updateGoalRecord(id, data) {
  const userId = await requireUserId();
  const patch = {};
  if (data.category !== undefined) patch.category = data.category;
  if (data.title !== undefined) patch.title = data.title;
  if (data.weeklyTarget !== undefined) patch.weekly_target = data.weeklyTarget;
  if (data.status !== undefined) patch.status = data.status;
  if (data.completionsCount !== undefined) patch.completions_count = data.completionsCount;
  if (data.weekStartDate !== undefined) patch.week_start_date = data.weekStartDate;
  if (data.lastCompletionAt !== undefined) patch.last_completion_at = data.lastCompletionAt;
  if (data.startedAt !== undefined) patch.started_at = data.startedAt;
  if (data.completedAt !== undefined) patch.completed_at = data.completedAt;
  const { data: row, error } = await supabase
    .from("wellness_goals")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return mapGoal(row);
}
