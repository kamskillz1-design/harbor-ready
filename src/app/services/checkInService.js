import { AppError, ErrorCodes } from "@/domain/errors";
import { validateCheckInForm } from "@/domain/validation/checkIn";
import {
  getCheckInByLocalDate,
  listRecentCheckIns,
  upsertCheckIn,
} from "@/adapters/base44/entities/checkInAdapter";
import { getMyProfile } from "@/adapters/base44/entities/profileAdapter";

export function localDateForTimezone(timezone, date) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date || new Date());
  } catch (e) {
    return new Intl.DateTimeFormat("en-CA").format(date || new Date());
  }
}

export function weekAgoLocal(timezone) {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return localDateForTimezone(timezone, date);
}

export async function getTodayCheckIn(timezone) {
  return getCheckInByLocalDate(localDateForTimezone(timezone));
}

export function getRecentCheckIns(limit) {
  return listRecentCheckIns(limit);
}

export async function saveCheckIn(input) {
  const validated = validateCheckInForm(input);
  if (!validated.valid) {
    const error = new AppError(ErrorCodes.VALIDATION_FAILED);
    error.fields = validated.errors;
    throw error;
  }
  try {
    const profile = await getMyProfile();
    if (!profile) throw new AppError(ErrorCodes.FORBIDDEN);
    const localDate = localDateForTimezone(profile.timezone);
    return await upsertCheckIn({
      ...validated.value,
      localDate,
      checkedInAt: new Date().toISOString(),
    });
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(ErrorCodes.DEPENDENCY_UNAVAILABLE);
  }
}
