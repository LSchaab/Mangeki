import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#576FA7', // Azul Celestial
          red: '#FF3E37', // Rojo Coral
          'red-light': '#FA9F9E', // Rosa Sakura
          sakura: '#FA9F9E', // Rosa Sakura (alias)
          navy: '#192B56', // Azul Medianoche
          charcoal: '#151515', // Negro Carbón
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
