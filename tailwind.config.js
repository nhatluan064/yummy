/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f5f5ff",
          100: "#ebebfe",
          200: "#d7d7fd",
          300: "#bfbffb",
          400: "#a5a5f7",
          500: "#8787f4",
          600: "#6565d8",
          700: "#5555c0",
          800: "#4444a0",
          900: "#333380",
        },
        secondary: {
          50: "#e8e7ef",
          100: "#c8c5d9",
          200: "#a8a3c3",
          300: "#8881ad",
          400: "#5d5781",
          500: "#3d3760",
          600: "#2d274b",
          700: "#25203f",
          800: "#1d1933",
          900: "#151227",
        },
        accent: {
          50: "#fdfcff",
          100: "#f9f8fe",
          200: "#f3f1fe",
          300: "#e8e4fe",
          400: "#ddd7fd",
          500: "#d4ccfc",
          600: "#c5b9f9",
          700: "#b5a5f6",
          800: "#a692f3",
          900: "#977ff0",
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-down": "fadeInDown 0.6s ease-out forwards",
        "fade-in-left": "fadeInLeft 0.6s ease-out forwards",
        "fade-in-right": "fadeInRight 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInDown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInLeft: {
          "0%": {
            opacity: "0",
            transform: "translateX(-30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        fadeInRight: {
          "0%": {
            opacity: "0",
            transform: "translateX(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        scaleIn: {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
      },
    },
  },
  plugins: [],
};
