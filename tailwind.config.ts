import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Advia palette — deep forest green + warm cream */
        primary: {
          50: "#f0faf3",
          100: "#d9f2e0",
          200: "#b3e5c1",
          300: "#7ed39a",
          400: "#4abb70",
          500: "#1a7a3a",
          600: "#145224",  /* main brand */
          700: "#0E3919",  /* text on light */
          800: "#0A2912",  /* dark bg / hover */
          900: "#071f0e",
          950: "#04130a",
        },
        accent: {
          50: "#faf8f5",
          100: "#f5f0ea",
          200: "#EFEDE7",  /* cream bg */
          300: "#e5e1d8",
          400: "#DEDACE",  /* heading underline */
          500: "#dad6c8",
          600: "#c4bfb0",
          700: "#a39e90",
          800: "#827d70",
          900: "#615d52",
        },
        surface: {
          50: "#faf9f7",
          100: "#f5f3f0",
          200: "#edece9",
          300: "#e5e3de",
          400: "#dad6c8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
          xl: "3rem",
          "2xl": "4rem",
        },
      },
      borderRadius: {
        "card": "12px",
        "btn": "24px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)",
        header: "0 1px 0 rgba(0,0,0,0.06)",
        search: "0 4px 20px rgba(20,82,36,0.10)",
        "glass": "0 8px 32px rgba(0,0,0,0.04)",
        "premium": "0 20px 60px -12px rgba(0,0,0,0.12)",
      },
      transitionTimingFunction: {
        advia: "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
      },
    },
  },
  plugins: [],
};

export default config;
