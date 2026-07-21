import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        deep: "#0E3A37",
        gold: "#B8791F",
        paper: "#FBF8F1",
      },
    },
  },
  plugins: [],
};

export default config;
