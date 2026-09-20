import { supabase } from "@/api/supabaseClient";
import { requireUserId } from "@/api/currentUser";

export function mapMessage(raw) {
  return {
    id: raw.id,
    role: raw.role,
    content: raw.content || null,
    mode: raw.mode || null,
    createdAt: raw.created_at || null,
  };
}

export async function listCompanionMessages(limit) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("companion_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit || 60);
  if (error) throw error;
  return (data || []).map(mapMessage).reverse();
}

export async function createCompanionMessage({ role, content, mode }) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("companion_messages")
    .insert({
      user_id: userId,
      role,
      content: content || null,
      mode: mode || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapMessage(data);
}
