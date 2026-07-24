import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f5f7f2",
        ink: "#0f1720",
        brand: {
          DEFAULT: "#0d7a63",
          soft: "#d6f1e8",
          dark: "#0a5a49"
        }
      },
      boxShadow: {
        panel: "0 16px 40px rgba(15, 23, 32, 0.08)"
      },
      borderRadius: {
        panel: "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;
