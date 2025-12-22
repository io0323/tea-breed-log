import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "tea-green": "#D4E6B5",
        "tea-dark": "#2C4A32",
        "tea-light": "#E8F4D6",
        "tea-brown": "#5C3D2E",
      },
    },
  },
  plugins: [],
};

export default config;
