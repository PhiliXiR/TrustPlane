export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#081018',
        panel: '#0d1722',
        line: '#243244',
        muted: '#8fa0b3',
        accent: '#8fd0ff',
        success: '#8ff0b2',
        warn: '#ffd48f',
        danger: '#ff8b99',
        violet: '#caa9ff'
      },
      boxShadow: {
        panel: '0 18px 60px rgba(0,0,0,0.28)'
      }
    },
  },
  plugins: [],
};
