import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import classnamePrefixPlugin from "./vite-plugin-classname-prefix";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Prefix all TSX/JSX className/class string literals with `korinai:`
    react(),
    // classnamePrefixPlugin({ prefix: "korinai" }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Point to package roots so subpath imports resolve correctly
      react: path.resolve(__dirname, "node_modules/preact/compat"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/preact/jsx-runtime"),
      "react-dom": path.resolve(__dirname, "node_modules/preact/compat"),
      "react-dom/client": path.resolve(__dirname, "node_modules/preact/compat"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    lib: {
      entry: "src/embed.tsx",
      name: "KorinAI",
      formats: ["iife"],
      fileName: () => `embed.js`,
    },
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      // Bundle react/react-dom to make the script self-contained for plain HTML usage
      // external: ["react", "react-dom", "katex"],
      external: [],
      output: {
        // globals: {
        //   react: "React",
        //   "react-dom": "ReactDOM",
        //   katex: "katex",
        // },
        // Inject shims early so dependencies can reference them during module init
        banner: `/**
 * @korinai/embed v${pkg.version}
 * (c) ${new Date().getFullYear()} Korin AI
 * @license ${pkg.license || "UNLICENSED"}
 */

(function(){
  try {
    var g = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : this);
    if (g && typeof g.process === 'undefined') {
      g.process = { env: { NODE_ENV: '${process.env.NODE_ENV || "production"}' } };
    } else if (g && g.process && !g.process.env) {
      g.process.env = { NODE_ENV: '${process.env.NODE_ENV || "production"}' };
    }
    if (g && typeof g.global === 'undefined') {
      g.global = g;
    }
  } catch (_) { /* noop */ }
})();
`,
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
