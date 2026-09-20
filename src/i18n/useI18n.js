import { useCallback, useSyncExternalStore } from "react";
import { getAppLanguage, setAppLanguage, subscribeToLanguage, translate } from "./index";

// The one i18n hook every component uses for visible text.
export function useI18n() {
  const language = useSyncExternalStore(subscribeToLanguage, getAppLanguage, getAppLanguage);
  const t = useCallback(
    (key, params) => translate(key, params),
    [language]
  );
  return { t: t, language: language, setLanguage: setAppLanguage };
}