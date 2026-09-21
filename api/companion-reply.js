const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.6-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
].filter(Boolean);

function languageName(code) {
  if (code === "eu") return "Basque (Euskara)";
  if (code === "en") return "English";
  return "Spanish";
}

function systemPrompt(language) {
  return [
    "You are Harbor, a calm private wellbeing companion for self-reflection.",
    "You are not a therapist, doctor, or crisis service. Do not diagnose or prescribe.",
    "Reply in " + languageName(language) + ".",
    "Keep replies short: 2 to 5 sentences. Be warm, specific to what the person just said, and invite one small next step.",
    "Do not lecture. Do not mention that you are an AI unless asked.",
    "If the person sounds in immediate danger, tell them to contact local emergency services or open Help Now, and keep the reply brief.",
  ].join(" ");
}

async function listModels(key) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models?pageSize=100",
    { headers: { "x-goog-api-key": key } }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || "Could not list Gemini models");
  }
  const names = (data.models || [])
    .filter((model) => (model.supportedGenerationMethods || []).includes("generateContent"))
    .map((model) => String(model.name || "").replace(/^models\//, ""));
  return names;
}

async function callGemini(key, model, contents, language) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(model) +
    ":generateContent";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt(language) }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
    }),
  });
  const data = await response.json().catch(() => ({}));
  const reply = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
  return {
    ok: response.ok && !!reply,
    reply: reply || "",
    error: data?.error?.message || (!response.ok ? "Gemini request failed (" + response.status + ")" : "Empty Gemini reply"),
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    res.status(200).json({
      configured: Boolean(process.env.GEMINI_API_KEY),
      models: FALLBACK_MODELS,
    });
    return;
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    res.status(500).json({ error: "GEMINI_API_KEY is not set on the server" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  body = body || {};

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const language = body.language === "en" || body.language === "eu" ? body.language : "es";
  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];

  if (!text || text.length > 4000) {
    res.status(400).json({ error: "Invalid text" });
    return;
  }

  const contents = [];
  history.forEach((item) => {
    if (!item || !item.content) return;
    contents.push({
      role: item.role === "companion" ? "model" : "user",
      parts: [{ text: String(item.content).slice(0, 4000) }],
    });
  });
  contents.push({ role: "user", parts: [{ text }] });

  let models = FALLBACK_MODELS.slice();
  try {
    const available = await listModels(key);
    const extras = available.filter(
      (name) => /flash/i.test(name) && !name.includes("image") && !models.includes(name)
    );
    models = [...models, ...extras].slice(0, 10);
  } catch (err) {
    // Keep fallback list if listing fails
  }

  let lastError = "Gemini request failed";
  for (const model of models) {
    try {
      const result = await callGemini(key, model, contents, language);
      if (result.ok) {
        res.status(200).json({ reply: result.reply, model });
        return;
      }
      lastError = result.error || lastError;
    } catch (err) {
      lastError = err?.message || lastError;
    }
  }

  res.status(502).json({ error: lastError });
}
