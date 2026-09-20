// Portable goal rules. No platform imports.
import { GOAL_CODES } from "@/domain/validation/profile";

export const GOAL_STATUSES = ["active", "paused", "completed", "archived"];
export const MAX_ACTIVE_GOALS = 3;

// Centralized status machine for wellbeing goals.
export const GOAL_TRANSITIONS = {
  active: ["paused", "completed", "archived"],
  paused: ["active", "completed", "archived"],
  completed: ["archived"],
  archived: []
};

export function canTransition(fromStatus, toStatus) {
  return (GOAL_TRANSITIONS[fromStatus] || []).includes(toStatus);
}

export function validateGoalForm(values) {
  const errors = {};
  const title = (values.title || "").trim();
  if (title.length < 1 || title.length > 120) errors.title = "invalid";
  if (!GOAL_CODES.includes(values.category)) errors.category = "invalid";
  const weeklyTarget = values.weeklyTarget ?? null;
  if (weeklyTarget !== null && (!Number.isInteger(weeklyTarget) || weeklyTarget < 1 || weeklyTarget > 7)) {
    errors.weeklyTarget = "invalid";
  }
  const valid = Object.keys(errors).length === 0;
  return {
    valid: valid,
    errors: errors,
    value: valid ? { title: title, category: values.category, weeklyTarget: weeklyTarget } : null
  };
}

export function todayLocalDateString() {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

function daysBetween(fromDate, toDate) {
  const from = new Date(fromDate + "T00:00:00Z").getTime();
  const to = new Date(toDate + "T00:00:00Z").getTime();
  return Math.floor((to - from) / 86400000);
}

// Weekly completion bookkeeping: resets the counter when a new week starts.
export function completionUpdate(goal, todayLocal) {
  const start = goal.weekStartDate;
  const sameWeek = start !== null && start !== undefined && daysBetween(start, todayLocal) >= 0 && daysBetween(start, todayLocal) < 7;
  return {
    completionsCount: (sameWeek ? goal.completionsCount || 0 : 0) + 1,
    weekStartDate: sameWeek ? start : todayLocal,
    lastCompletionAt: new Date().toISOString()
  };
}