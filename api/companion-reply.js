const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

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

export default async function handler(req, res) {
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
    res.status(500).json({ error: "GEMINI_API_KEY is not set" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
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

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(MODEL) +
    ":generateContent?key=" +
    encodeURIComponent(key);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt(language) }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      res.status(502).json({ error: data?.error?.message || "Gemini request failed" });
      return;
    }
    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();
    if (!reply) {
      res.status(502).json({ error: "Empty Gemini reply" });
      return;
    }
    res.status(200).json({ reply });
  } catch (err) {
    res.status(502).json({ error: "Gemini request failed" });
  }
}
