import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './hooks/**/*.{ts,tsx,js,jsx}',
    './lib/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
    './styles/**/*.{css,ts,tsx}',
    './public/**/*.{html,js}',
    './node_modules/@livekit/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
      },
    },
  },
};

export default config;
