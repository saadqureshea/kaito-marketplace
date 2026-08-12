/** @type {import('tailwindcss').Config} */

// Colours resolve through CSS variables (see index.css) so light/dark swap
// by re-declaring the variables rather than by adding a dark: variant to
// every utility. The rgb(... / <alpha-value>) form is what keeps existing
// opacity modifiers like `text-ink-700/60` working.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic surfaces
        canvas: token("canvas"), // page background
        surface: token("surface"), // cards, navbar, inputs
        "on-brand": token("on-brand"), // text/icons sitting on a signal fill

        // KAITO design tokens - "signal indigo" identity, not the generic
        // cream/terracotta AI-default palette.
        ink: {
          950: token("ink-950"), // strongest text
          900: token("ink-900"),
          700: token("ink-700"), // muted text, often used at /50-/70
        },
        paper: {
          50: token("paper-50"),
          100: token("paper-100"),
        },
        signal: {
          400: token("signal-400"),
          500: token("signal-500"), // primary indigo - CTAs, links, active states
          600: token("signal-600"), // hover (darker in light, lighter in dark)
        },
        kaito: {
          gold: token("gold"), // accent - used sparingly (badges, highlights)
        },
        line: token("line"),
      },
      fontFamily: {
        // A warm serif carries the craft/editorial register the emerald
        // palette sets up; a geometric sans read as generic tech next to it.
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--c-shadow) / 0.06), 0 8px 24px -12px rgb(var(--c-shadow) / 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
