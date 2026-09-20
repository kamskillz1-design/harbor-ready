// Client-side bounds for companion messages.
export const MAX_MESSAGE_CHARS = 2000;

export function validateCompanionMessage(text) {
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (trimmed.length < 1) {
    return { valid: false, errors: { message: "message_required" } };
  }
  if (trimmed.length > MAX_MESSAGE_CHARS) {
    return { valid: false, errors: { message: "message_too_long" } };
  }
  return { valid: true, value: trimmed };
}