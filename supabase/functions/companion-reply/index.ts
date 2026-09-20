// Optional Edge Function: restore hosted LLM replies later.
// The web app currently uses the client shim in companionService.js.
// Deploy: supabase functions deploy companion-reply
// Then point companionService at this function if you add an LLM provider.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors() });
  }
  const auth = req.headers.get("Authorization") || "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_ANON_KEY") || "",
    { global: { headers: { Authorization: auth } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return json({ ok: false, code: "AUTH_REQUIRED" }, 401);
  }
  return json({
    ok: true,
    data: {
      interrupted: false,
      mode: "normal",
      reply: null,
      stub: true,
    },
  });
});

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(), "Content-Type": "application/json" },
  });
}
