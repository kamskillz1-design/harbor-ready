// Portable journal rules. No platform imports.
export const PROMPT_TYPES = ["gratitude", "reflection", "challenge", "intention", "self_compassion"];
export const TITLE_MAX_LENGTH = 160;
export const BODY_MAX_LENGTH = 10000;

export function validateJournalForm(values) {
  const errors = {};
  const title = (values.title || "").trim();
  if (title.length > TITLE_MAX_LENGTH) errors.title = "too_long";

  const body = (values.body || "").trim();
  if (body.length < 1 || body.length > BODY_MAX_LENGTH) errors.body = "invalid_body";

  const promptType = values.promptType || null;
  if (promptType && !PROMPT_TYPES.includes(promptType)) errors.promptType = "invalid";

  const moodScore = values.moodScore ?? null;
  if (moodScore !== null && (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 5)) {
    errors.moodScore = "invalid";
  }

  const valid = Object.keys(errors).length === 0;
  return {
    valid: valid,
    errors: errors,
    value: valid ? { title: title || null, body: body, promptType: promptType, moodScore: moodScore } : null
  };
}