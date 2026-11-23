import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { ink: "#171717", muted: "#737373", brand: "#5b4bdb", canvas: "#f7f7f5" }, boxShadow: { soft: "0 8px 30px rgba(0,0,0,.06)" } } }, plugins: [] };
export default config;
