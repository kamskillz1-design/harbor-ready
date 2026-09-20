import { AppError, ErrorCodes } from "@/domain/errors";
import { validateJournalForm } from "@/domain/validation/journal";
import {
  listJournalEntries,
  createJournalRecord,
  updateJournalRecord,
  deleteJournalRecord,
} from "@/adapters/base44/entities/journalAdapter";

export function listEntries(limit) {
  return listJournalEntries(limit);
}

export function matchesEntry(entry, query) {
  const normalized = (query || "").trim().toLowerCase();
  if (!normalized) return true;
  return ((entry.title || "") + " " + entry.body).toLowerCase().includes(normalized);
}

export async function createEntry(input) {
  const validated = validateJournalForm(input);
  if (!validated.valid) {
    const error = new AppError(ErrorCodes.VALIDATION_FAILED);
    error.fields = validated.errors;
    throw error;
  }
  try {
    return await createJournalRecord(validated.value);
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(ErrorCodes.DEPENDENCY_UNAVAILABLE);
  }
}

export async function updateEntry(id, input) {
  const validated = validateJournalForm(input);
  if (!validated.valid) {
    const error = new AppError(ErrorCodes.VALIDATION_FAILED);
    error.fields = validated.errors;
    throw error;
  }
  try {
    return await updateJournalRecord(id, validated.value);
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(ErrorCodes.DEPENDENCY_UNAVAILABLE);
  }
}

export async function deleteEntry(id) {
  try {
    await deleteJournalRecord(id);
    return { deleted: true };
  } catch (e) {
    throw new AppError(ErrorCodes.DEPENDENCY_UNAVAILABLE);
  }
}
