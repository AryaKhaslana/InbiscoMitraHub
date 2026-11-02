/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border, 0 0% 89%))",
        input: "hsl(var(--input, 0 0% 89%))",
        ring: "hsl(var(--ring, 0 100% 28%))",
        background: "#fcf9f8",
        foreground: "#1b1c1c",
        primary: {
          DEFAULT: "#900000",
          foreground: "#ffffff",
          container: "#bd0000",
          "on-container": "#ffc9c1",
          fixed: "#ffdad4",
          "on-fixed": "#410000",
        },
        secondary: {
          DEFAULT: "#b6171e",
          foreground: "#ffffff",
          container: "#da3433",
          "on-container": "#fffbff",
          fixed: "#ffdad6",
          "on-fixed": "#410003",
        },
        tertiary: {
          DEFAULT: "#735c00",
          foreground: "#ffffff",
          container: "#cca830",
          "on-container": "#4f3e00",
          fixed: "#ffe088",
          "on-fixed": "#241a00",
        },
        surface: {
          DEFAULT: "#fcf9f8",
          bright: "#fcf9f8",
          dim: "#dcd9d9",
          tint: "#c00402",
          container: {
            lowest: "#ffffff",
            low: "#f6f3f2",
            DEFAULT: "#f0eded",
            high: "#eae7e7",
            highest: "#e5e2e1",
          },
          variant: "#e5e2e1",
        },
        "on-surface": {
          DEFAULT: "#1b1c1c",
          variant: "#5d3f3b",
        },
        outline: {
          DEFAULT: "#926f69",
          variant: "#e7bdb6",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      spacing: {
        "space-2xs": "0.25rem",
        "space-xs": "0.5rem",
        "space-sm": "0.75rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
        "space-2xl": "3rem",
        "space-3xl": "4rem",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
}
