/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F8FAFC", // Slate 50
                surface: "#FFFFFF",
                primary: "#FB7185", // Rose 400
                secondary: "#94A3B8", // Slate 400
                accent: "#2DD4BF", // Teal 400
                text: {
                    main: "#334155", // Slate 700
                    muted: "#64748B", // Slate 500
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
