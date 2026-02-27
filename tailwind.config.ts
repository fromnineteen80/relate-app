import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Noto Serif', 'Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        background: '#fafaf9',
        foreground: '#292524',
        accent: {
          DEFAULT: '#c2410c',
          hover: '#9a3412',
        },
        secondary: '#78716c',
        border: '#e7e5e4',
        success: '#047857',
        warning: '#d97706',
        danger: '#be123c',
      },
    },
  },
  plugins: [],
};
export default config;
