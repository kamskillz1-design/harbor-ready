// Locale-aware formatting helpers driven by the central language module.
const LOCALES = { en: "en-GB", es: "es-ES", eu: "eu-ES" };

export function getLocale(language) {
  return LOCALES[language] || LOCALES.en;
}

export function formatDate(isoString, language) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(getLocale(language), { day: "numeric", month: "short", year: "numeric" });
}