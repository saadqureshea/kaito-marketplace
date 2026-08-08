import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "kaito_theme";

// Mirrors the inline script in index.html, which applies the same decision
// before first paint so the page never flashes the wrong theme.
function resolveInitialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    // See .theme-switching in index.css - transitions must be off across the
    // swap or elements keep the colour they computed under the old palette.
    root.classList.add("theme-switching");
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);

    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("theme-switching"))
    );
    return () => cancelAnimationFrame(frame);
  }, [theme]);

  // Follow the OS while the user hasn't made an explicit choice.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
