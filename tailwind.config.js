// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F111A",
        surface: "#1A1D27",
        primary: "#8B5CF6",
        primaryHover: "#7C3AED",
        textMain: "#F3F4F6",
        textMuted: "#9CA3AF",
      },
    },
  },
  plugins: [],
};
