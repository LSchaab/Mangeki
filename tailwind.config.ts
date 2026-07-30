import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#556FA0',
          red: '#E7403B',
          'red-light': '#FFDADA',
          navy: '#1F2D52',
        },
      },
      fontFamily: {
        display: ['var(--font-quicksand)', 'sans-serif'],
        body: ['var(--font-quicksand)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
