/** Tailwind config - "Broadcast Studio" design direction:
 *  deep charcoal background, amber "on-air" accent, monospace data labels.
 */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#12131a",
          panel: "#191b24",
          border: "#2a2d3a",
          text: "#e9e9ee",
          muted: "#8b8d9c",
        },
        amber: {
          signal: "#ffb020",
        },
        teal: {
          calm: "#3fd6c5",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
