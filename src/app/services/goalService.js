// Goal use cases. Row-level security enforces ownership on every write.
import { AppError, ErrorCodes } from "@/domain/errors";
import {
  MAX_ACTIVE_GOALS,
  canTransition,
  completionUpdate,
  todayLocalDateString,
  validateGoalForm
} from "@/domain/validation/goal";
import {
  createGoalRecord,
  listAllGoals,
  updateGoalRecord
} from "@/adapters/base44/entities/goalAdapter";

export function listGoals() {
  return listAllGoals();
}

export function countActive(goals) {
  return goals.filter((goal) => goal.status === "active").length;
}

export async function createGoal(input) {
  const validated = validateGoalForm(input);
  if (!validated.valid) {
    const error = new AppError(ErrorCodes.VALIDATION_FAILED);
    error.fields = validated.errors;
    throw error;
  }
  const goals = await listGoals();
  if (countActive(goals) >= MAX_ACTIVE_GOALS) {
    throw new AppError(ErrorCodes.CONFLICT);
  }
  return createGoalRecord({
    category: validated.value.category,
    title: validated.value.title,
    weeklyTarget: validated.value.weeklyTarget,
    status: "active",
    completionsCount: 0,
    startedAt: new Date().toISOString()
  });
}

export async function updateGoalStatus(goal, status) {
  if (!canTransition(goal.status, status)) {
    throw new AppError(ErrorCodes.VALIDATION_FAILED);
  }
  const patch = { status: status };
  if (status === "completed") {
    patch.completedAt = new Date().toISOString();
  }
  return updateGoalRecord(goal.id, patch);
}

export async function markGoalDone(goal) {
  const patch = completionUpdate(goal, todayLocalDateString());
  return updateGoalRecord(goal.id, patch);
}