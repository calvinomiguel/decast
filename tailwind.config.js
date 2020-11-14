module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: [],
  theme: {
    fontFamily: {
      mono: ['Roboto Mono', 'monospace'],
      body: ['Roboto', 'sans-serif'],
    },
    extend: {
      colors: {
        strawberry: "#cc0b3d",
        hay: "#ff9766",
        meadow: "#8cb224",
        ciel: "#006cff",
        night: {
          100: "#515458",
          200: "#33373D",
          300: "#26292e",
          400: "#131319",
        },
        cloud: "#ffffff",
      }
    },
  },
  variants: {},
  plugins: [],
}
