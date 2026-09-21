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

async function fetchGeminiReply(text, history, language) {
  const response = await fetch("/api/companion-reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, history, language }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.reply) {
    const err = new AppError(ErrorCodes.AI_UNAVAILABLE);
    err.detail = data?.error || "";
    throw err;
  }
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

  const reply = await fetchGeminiReply(trimmed, history, language);
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
