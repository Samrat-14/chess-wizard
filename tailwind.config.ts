import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'primary-color': 'var(--primary-color)',
        'primary-color-dark': 'var(--primary-color-dark)',
        'primary-color-darker': 'var(--primary-color-darker)',
        'primary-color-selection': 'var(--primary-color-selection',
        'secondary-color': 'var(--secondary-color)',
        'bg-color': 'var(--bg-color)',
        'secondary-color-selection': 'var(--secondary-color-selection)',
        'tertiary-color': 'var(--tertiary-color)',
        'bg-color-light': 'var(--bg-color-light)',
        'bg-color-lighter': 'var(--bg-color-lighter)',
      },
    },
  },
  plugins: [],
};
export default config;
