// Portable exercise rules. No platform imports.
import { EMOTION_TAGS } from "@/domain/validation/checkIn";

export const EXERCISE_SLUGS = [
  "grounding-54321",
  "slow-breathing",
  "thought-record",
  "evidence-check",
  "small-step-planner",
  "self-compassion"
];
export const REFLECTION_MAX = 4000;
export const ACTION_MAX = 500;
export const SHORT_MAX = 2000;
export const LONG_MAX = 3000;
export const PLAN_MAX = 1000;
export const MAX_EMOTIONS = 6;

export function validateThoughtRecordForm(tr) {
  const errors = {};
  if (!tr.situation || !tr.situation.trim() || tr.situation.trim().length > SHORT_MAX) errors.situation = "invalid";
  if (!tr.automaticThought || !tr.automaticThought.trim() || tr.automaticThought.trim().length > SHORT_MAX) {
    errors.automaticThought = "invalid";
  }
  const emotions = Array.isArray(tr.emotions) ? tr.emotions : [];
  if (emotions.length < 1 || emotions.length > MAX_EMOTIONS) {
    errors.emotions = "invalid";
  } else if (
    emotions.some(
      (e) => !e || !EMOTION_TAGS.includes(e.code) || !Number.isInteger(e.intensity) || e.intensity < 1 || e.intensity > 5
    )
  ) {
    errors.emotions = "invalid";
  }
  if ((tr.evidenceFor || "").length > LONG_MAX) errors.evidenceFor = "too_long";
  if ((tr.evidenceAgainst || "").length > LONG_MAX) errors.evidenceAgainst = "too_long";
  if (!tr.balancedThought || !tr.balancedThought.trim() || tr.balancedThought.trim().length > LONG_MAX) {
    errors.balancedThought = "invalid";
  }
  if ((tr.actionPlan || "").length > PLAN_MAX) errors.actionPlan = "too_long";
  const valid = Object.keys(errors).length === 0;
  return {
    valid: valid,
    errors: errors,
    value: valid
      ? {
          situation: tr.situation.trim(),
          automaticThought: tr.automaticThought.trim(),
          emotions: emotions,
          evidenceFor: (tr.evidenceFor || "").trim() || null,
          evidenceAgainst: (tr.evidenceAgainst || "").trim() || null,
          balancedThought: tr.balancedThought.trim(),
          actionPlan: (tr.actionPlan || "").trim() || null
        }
      : null
  };
}

export function validateExerciseForm(input) {
  const errors = {};
  if (!EXERCISE_SLUGS.includes(input.exerciseSlug)) errors.exerciseSlug = "invalid";
  const reflection = (input.reflection || "").trim();
  if (reflection.length > REFLECTION_MAX) errors.reflection = "too_long";
  const helpfulnessScore = input.helpfulnessScore ?? null;
  if (helpfulnessScore !== null && (!Number.isInteger(helpfulnessScore) || helpfulnessScore < 1 || helpfulnessScore > 5)) {
    errors.helpfulnessScore = "invalid";
  }
  const actionText = (input.actionText || "").trim();
  if (actionText.length > ACTION_MAX) errors.actionText = "too_long";
  const durationSeconds = input.durationSeconds ?? null;
  if (durationSeconds !== null && (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 7200)) {
    errors.durationSeconds = "invalid";
  }

  let thoughtRecordValue = null;
  if (input.thoughtRecord) {
    if (input.exerciseSlug !== "thought-record") {
      errors.thoughtRecord = "invalid";
    } else {
      const tr = validateThoughtRecordForm(input.thoughtRecord);
      if (!tr.valid) errors.thoughtRecord = "invalid";
      else thoughtRecordValue = tr.value;
    }
  }

  const valid = Object.keys(errors).length === 0;
  return {
    valid: valid,
    errors: errors,
    value: valid
      ? {
          exerciseSlug: input.exerciseSlug,
          reflection: reflection || null,
          helpfulnessScore: helpfulnessScore,
          actionText: actionText || null,
          durationSeconds: durationSeconds,
          thoughtRecord: thoughtRecordValue
        }
      : null
  };
}