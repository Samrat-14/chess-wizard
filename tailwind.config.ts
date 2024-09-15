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
        'secondary-color': 'var(--secondary-color)',
        'bg-color': 'var(--bg-color)',
      },
    },
  },
  plugins: [],
};
export default config;
