// Portable onboarding/profile rules. No platform imports.
export const GOAL_CODES = [
  "manage-stress",
  "consistent-routines",
  "reflect-emotions",
  "improve-sleep",
  "build-confidence",
  "self-compassion",
  "improve-focus",
  "healthier-boundaries"
];

export const MAX_GOALS = 5;
export const DISPLAY_NAME_MAX = 80;

export function validateDisplayName(value) {
  return typeof value === "string" && value.trim().length >= 1 && value.trim().length <= DISPLAY_NAME_MAX;
}

export function validateTimezone(timezone) {
  if (typeof timezone !== "string" || !timezone) return false;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: timezone });
    return true;
  } catch (e) {
    return false;
  }
}

export function validateGoals(goals) {
  return (
    Array.isArray(goals) &&
    goals.length <= MAX_GOALS &&
    goals.every((goal) => GOAL_CODES.includes(goal))
  );
}