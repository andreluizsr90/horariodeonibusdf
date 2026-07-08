import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta institucional (tons de azul do transporte público do DF)
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcdcff",
          300: "#8ec6ff",
          400: "#59a6ff",
          500: "#3384fc",
          600: "#1d63f1",
          700: "#164ede",
          800: "#1840b4",
          900: "#1a3a8e",
          950: "#142456",
        },
        accent: {
          400: "#ffc848",
          500: "#ffb020",
          600: "#e69100",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          lg: "2rem",
        },
      },
    },
  },
  plugins: [],
};

export default config;
