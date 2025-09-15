import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import classnamePrefixPlugin from "./vite-plugin-classname-prefix";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  // Only run the classname codemod plugin; no React/Babel transforms for speed
  plugins: [classnamePrefixPlugin({ prefix: "korinai", codemod: true })],
  build: {
    // Don't write any bundle output – we only need transform hooks to run
    write: false,
    minify: false,
    sourcemap: false,
    emptyOutDir: false,
    reportCompressedSize: false,
    // Use a minimal Rollup input to traverse the TSX graph so transforms run
    rollupOptions: {
      input: path.resolve(__dirname, "src/embed.tsx"),
      output: {
        // Not written due to write:false; keep defaults minimal
        dir: "dist",
      },
    },
  },
});
