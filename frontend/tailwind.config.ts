import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        signal: {
          blue: "#2c6bed",
          "blue-hover": "#2257be",
          "blue-light": "#e8f0fe",
          "blue-dark": "#1d4ed8",
          dark: {
            bg: "#121214",
            sidebar: "#1a1a1e",
            panel: "#161619",
            border: "#28282e",
            hover: "#26262c",
            bubbleIncoming: "#2b2b32",
            bubbleOutgoing: "#2c6bed",
            text: "#f3f3f5",
            muted: "#9a9aa2",
          },
          light: {
            bg: "#f3f4f6",
            sidebar: "#ffffff",
            panel: "#fafafa",
            border: "#e5e7eb",
            hover: "#f3f4f6",
            bubbleIncoming: "#e9eaee",
            bubbleOutgoing: "#2c6bed",
            text: "#111827",
            muted: "#6b7280",
          }
        }
      },
      borderRadius: {
        "bubble": "1.25rem",
      }
    },
  },
  plugins: [],
};
export default config;
