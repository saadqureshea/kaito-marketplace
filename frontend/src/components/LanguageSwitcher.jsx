import { Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

// Two languages only, so this is a plain toggle rather than a dropdown -
// matches ThemeToggle's shape in the navbar.
export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, languages } = useLanguage();
  const next = languages.find((l) => l.code !== lang) || languages[0];

  return (
    <button
      onClick={() => setLang(next.code)}
      type="button"
      aria-label={`Switch to ${next.label}`}
      title={`Switch to ${next.label}`}
      className={`flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-medium text-ink-700/70 transition hover:border-signal-500 hover:text-signal-500 ${className}`}
    >
      <Languages className="h-3.5 w-3.5" />
      {next.code.toUpperCase()}
    </button>
  );
}
