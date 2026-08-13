import { createContext, useContext, useEffect, useState } from "react";
import { LANGUAGES, dictionaries } from "../i18n/translations.js";

const LanguageContext = createContext(null);
const STORAGE_KEY = "kaito_lang";

function resolveInitialLang() {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  return dictionaries[stored] ? stored : "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(resolveInitialLang);

  useEffect(() => {
    const meta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  // key: dot path into the dictionary, e.g. "nav.digitalProducts". Falls back
  // to English, then to the key itself, so a missing translation never
  // renders blank.
  const t = (key, ...args) => {
    const lookup = (dict) =>
      key.split(".").reduce((acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined), dict);
    const value = lookup(dictionaries[lang]) ?? lookup(dictionaries.en) ?? key;
    return typeof value === "function" ? value(...args) : value;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
