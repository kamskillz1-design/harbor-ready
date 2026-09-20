// Central application language controller — the single source of truth for
// the active language (es, eu, en). One module reads, validates, persists, notifies.
import en from "./locales/en.js";
import es from "./locales/es.js";
import eu from "./locales/basque.js";
// All three catalogs are static ES modules resolved at build time.

const DICTIONARIES = { en: en, es: es, eu: eu };
const STORAGE_KEY = "harbor_language";
export const SOURCE_LANGUAGE = "en";
export const DEFAULT_LANGUAGE = "es";

let currentLanguage = null;
const listeners = new Set();

export function getSupportedLanguages() {
  return ["es", "eu", "en"];
}

export function isSupportedLanguage(code) {
  return getSupportedLanguages().includes(code);
}

function readStoredLanguage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function persistLanguage(code) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch (e) {
    // Preference persistence is best-effort only.
  }
}

function applyDocumentLanguage() {
  if (typeof document !== "undefined") {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = "ltr";
  }
}

function ensureInitialized() {
  if (currentLanguage === null) {
    const stored = readStoredLanguage();
    currentLanguage = isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE;
    applyDocumentLanguage();
  }
}

export function getAppLanguage() {
  ensureInitialized();
  return currentLanguage;
}

export function setAppLanguage(code) {
  ensureInitialized();
  if (!isSupportedLanguage(code)) {
    return currentLanguage;
  }
  if (code === currentLanguage) {
    return currentLanguage;
  }
  currentLanguage = code;
  persistLanguage(code);
  applyDocumentLanguage();
  listeners.forEach((listener) => listener(code));
  return currentLanguage;
}

export function subscribeToLanguage(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function translate(key, params) {
  ensureInitialized();
  let value = DICTIONARIES[currentLanguage] ? DICTIONARIES[currentLanguage][key] : undefined;
  if (value === undefined) {
    value = DICTIONARIES[SOURCE_LANGUAGE][key];
  }
  if (value === undefined) {
    return key;
  }
  if (params) {
    Object.keys(params).forEach((name) => {
      value = value.split("{" + name + "}").join(String(params[name]));
    });
  }
  return value;
}