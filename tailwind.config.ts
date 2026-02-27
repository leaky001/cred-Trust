import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "480px",   // Large mobile
      sm: "640px",   // Tablet+
      md: "768px",
      lg: "1024px",  // Desktop+
      xl: "1280px",
      "2xl": "1440px", // Wide (design system)
    },
    extend: {
      colors: {
        primary: {
          500: "#4F46E5",
          600: "#4338CA",
          700: "#3730A3",
        },
        accent: {
          500: "#06B6D4",
          600: "#0891B2",
        },
        gray: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        surface: "#FFFFFF",
        "surface-secondary": "#FAFAFA",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["48px", { lineHeight: "56px" }],
        h1: ["36px", { lineHeight: "44px" }],
        h2: ["30px", { lineHeight: "38px" }],
        h3: ["24px", { lineHeight: "32px" }],
        h4: ["20px", { lineHeight: "28px" }],
        "body-lg": ["18px", { lineHeight: "1.5" }],
        body: ["16px", { lineHeight: "1.5" }],
        small: ["14px", { lineHeight: "1.5" }],
        caption: ["12px", { lineHeight: "1.5" }],
      },
      spacing: {
        4.5: "18px",
        18: "72px",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "12px",
        lg: "20px",
        full: "999px",
      },
      boxShadow: {
        "elevation-1": "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "elevation-2": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
        "elevation-3": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
        "elevation-4": "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)",
        "glow-primary": "0 0 40px -8px rgb(79 70 229 / 0.4)",
        "glow-accent": "0 0 40px -8px rgb(6 182 212 / 0.35)",
      },
      maxWidth: {
        "container-sm": "640px",
        "container-md": "768px",
        "container-lg": "1024px",
        "container-xl": "1280px",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
