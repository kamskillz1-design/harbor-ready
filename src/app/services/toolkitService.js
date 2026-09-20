import { AppError, ErrorCodes } from "@/domain/errors";
import { validateExerciseForm } from "@/domain/validation/exercise";
import {
  deleteSession,
  listSessions,
  listTemplates,
  createSessionRecord,
  createThoughtRecord,
} from "@/adapters/base44/entities/exerciseAdapter";

export { deleteSession, listSessions, listTemplates };

export async function completeExercise(input) {
  const validated = validateExerciseForm(input);
  if (!validated.valid) {
    const error = new AppError(ErrorCodes.VALIDATION_FAILED);
    error.fields = validated.errors;
    throw error;
  }
  try {
    const templates = await listTemplates();
    const known = templates.some((t) => t.slug === validated.value.exerciseSlug && t.active);
    if (!known) {
      throw new AppError(ErrorCodes.VALIDATION_FAILED);
    }
    const session = await createSessionRecord(validated.value);
    let thoughtRecord = null;
    if (validated.value.thoughtRecord) {
      thoughtRecord = await createThoughtRecord(session.id, validated.value.thoughtRecord);
    }
    return { session, thoughtRecord };
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(ErrorCodes.DEPENDENCY_UNAVAILABLE);
  }
}
