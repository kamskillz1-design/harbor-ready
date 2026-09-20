// Portable daily check-in rules. No platform imports.
export const EMOTION_TAGS = [
  "calm",
  "content",
  "hopeful",
  "grateful",
  "energized",
  "tired",
  "stressed",
  "anxious",
  "overwhelmed",
  "sad",
  "frustrated",
  "angry",
  "lonely",
  "restless",
  "neutral"
];

export const MAX_EMOTION_TAGS = 5;
export const NOTE_MAX_LENGTH = 1000;

const SCORE_FIELDS = ["moodScore", "stressScore", "energyScore", "sleepScore"];

function isScore(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function validateCheckInForm(values) {
  const errors = {};
  for (const field of SCORE_FIELDS) {
    if (!isScore(values[field])) {
      errors[field] = "invalid_score";
    }
  }
  const tags = Array.isArray(values.emotionTags) ? values.emotionTags : [];
  if (tags.length > MAX_EMOTION_TAGS || tags.some((tag) => !EMOTION_TAGS.includes(tag))) {
    errors.emotionTags = "invalid_tags";
  }
  const note = typeof values.note === "string" ? values.note : "";
  if (note.length > NOTE_MAX_LENGTH) {
    errors.note = "too_long";
  }
  const valid = Object.keys(errors).length === 0;
  return {
    valid: valid,
    errors: errors,
    value: valid
      ? {
          moodScore: values.moodScore,
          stressScore: values.stressScore,
          energyScore: values.energyScore,
          sleepScore: values.sleepScore,
          emotionTags: tags,
          note: note.trim()
        }
      : null
  };
}