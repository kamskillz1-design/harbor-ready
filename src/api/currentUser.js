import { supabase } from "@/api/supabaseClient";

export async function requireUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    const err = new Error("AUTH_REQUIRED");
    err.code = "AUTH_REQUIRED";
    throw err;
  }
  return data.user.id;
}
