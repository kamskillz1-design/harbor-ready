// Timezone options shared by onboarding and settings.
const FALLBACK_TIMEZONES = [
  "UTC",
  "Europe/Madrid",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney"
];

export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch (e) {
    return "UTC";
  }
}

export function getTimezoneOptions(current) {
  let list;
  try {
    list =
      typeof Intl.supportedValuesOf === "function"
        ? Intl.supportedValuesOf("timeZone")
        : FALLBACK_TIMEZONES;
  } catch (e) {
    list = FALLBACK_TIMEZONES;
  }
  if (current && !list.includes(current)) {
    list = [current, ...list];
  }
  return list;
}