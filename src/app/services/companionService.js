import { AppError, ErrorCodes } from "@/domain/errors";
import { validateCompanionMessage } from "@/domain/validation/companion";
import { listCompanionMessages, createCompanionMessage } from "@/adapters/base44/entities/companionAdapter";

export function loadHistory() {
  return listCompanionMessages();
}

function normalizeMode(mode) {
  if (mode === "elevated") return "elevated";
  if (mode === "crisis") return "crisis";
  return "normal";
}

function classifyRisk(text) {
  const t = (text || "").toLowerCase();
  const crisisHints = [
    "suicid",
    "kill myself",
    "end my life",
    "want to die",
    "hurt myself",
    "self-harm",
    "self harm",
    "quitarme la vida",
    "matarme",
    "suicidatu",
  ];
  if (crisisHints.some((h) => t.includes(h))) return "crisis";
  const elevatedHints = ["hopeless", "panic", "can't go on", "no puedo más", "desesperad"];
  if (elevatedHints.some((h) => t.includes(h))) return "elevated";
  return "none";
}

function localReply(language, elevated) {
  if (language === "eu") {
    return elevated
      ? "Zaila dirudi orain. Hemen nago zurekin. Hartu arnasa, eta behar baduzu, hitz egin konfiantzazko norbaitekin edo ireki Laguntza orain."
      : "Eskerrik asko partekatzeagatik. Entzuten zaitut. Zer beharko zenuke orain, pauso txiki batean?";
  }
  if (language === "en") {
    return elevated
      ? "That sounds heavy. I'm here with you. Take a breath, and if you can, reach out to someone you trust or open Help Now."
      : "Thank you for sharing that. I'm listening. What would feel like a small, kind next step?";
  }
  return elevated
    ? "Suena difícil. Estoy aquí. Respira un momento, y si puedes, habla con alguien de confianza o abre Ayuda ahora."
    : "Gracias por compartirlo. Te escucho. ¿Qué sería un siguiente paso pequeño y amable?";
}

async function fetchGeminiReply(text, history, language) {
  const response = await fetch("/api/companion-reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, history, language }),
  });
  if (!response.ok) throw new Error("gemini_failed");
  const data = await response.json();
  if (!data?.reply) throw new Error("gemini_empty");
  return String(data.reply).slice(0, 4000);
}

export async function sendMessage(text, history, language) {
  const validated = validateCompanionMessage(text);
  if (!validated.valid) {
    throw new AppError(ErrorCodes.VALIDATION_FAILED);
  }
  const trimmed = validated.value;

  const userMessage = await createCompanionMessage({ role: "user", content: trimmed, mode: null });

  const risk = classifyRisk(trimmed);
  const mode = normalizeMode(risk === "none" ? "normal" : risk);

  if (risk === "crisis") {
    const companionMessage = await createCompanionMessage({
      role: "companion",
      content: null,
      mode: "crisis",
    });
    return {
      userMessage,
      companionMessage,
      interrupted: true,
      mode: "crisis",
    };
  }

  let reply;
  try {
    reply = await fetchGeminiReply(trimmed, history, language);
  } catch (e) {
    reply = localReply(language, risk === "elevated");
  }

  const companionMessage = await createCompanionMessage({
    role: "companion",
    content: reply,
    mode,
  });

  return {
    userMessage,
    companionMessage,
    interrupted: false,
    mode,
  };
}
