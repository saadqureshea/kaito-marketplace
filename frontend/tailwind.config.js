/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // KAITO design tokens - "signal indigo" identity, not the generic
        // cream/terracotta AI-default palette.
        ink: {
          950: "#0E1024",
          900: "#12142B",
          700: "#2A2D52",
        },
        paper: {
          50: "#FAFBFC",
          100: "#F2F4F8",
        },
        signal: {
          500: "#3B4CCA", // primary indigo - CTAs, links, active states
          600: "#2E3BA3",
          400: "#5C6BDB",
        },
        kaito: {
          gold: "#E3A857", // accent - used sparingly (badges, highlights)
        },
        line: "#E2E5ED",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,16,36,0.06), 0 8px 24px -12px rgba(14,16,36,0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
