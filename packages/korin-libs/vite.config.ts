import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";
import fg from "fast-glob";

// Collect all source entry points we want to preserve in the output
// This allows deep imports like @korinai/libs/hooks/useUser to keep working
const inputs = fg.sync(
  [
    "hooks/**/*.ts",
    "contexts/**/*.tsx",
    "ui/**/*.tsx",
    "libs/**/*.ts",
    "types/**/*.ts",
    // If you later add an index.ts, it will be picked up too
    "index.ts",
  ],
  { cwd: __dirname, absolute: false },
);

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: ".",
      include: ["hooks", "contexts", "ui", "libs", "types", "index.ts"],
      outDir: "dist",
      rollupTypes: true,
      // Ensure individual .d.ts files are emitted to mirror source structure
      // This makes pattern exports' types resolve correctly
      copyDtsFiles: true,
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      // Multi-entry build via Rollup below; Vite requires an entry but we'll not rely on it
      entry: inputs.length > 0 ? inputs[0] : "index.ts",
      name: "KorinLibs",
    },
    rollupOptions: {
      input: inputs.length > 0 ? inputs : undefined,
      external: ["react", "react/jsx-runtime", "react-dom", "swr", "ai", "@ai-sdk/react"],
      output: [
        {
          format: "es",
          preserveModules: true,
          preserveModulesRoot: ".",
          exports: "named",
          entryFileNames: `[name].mjs`,
          chunkFileNames: `[name]-[hash].mjs`,
        },
        {
          format: "cjs",
          preserveModules: true,
          preserveModulesRoot: ".",
          exports: "named",
          entryFileNames: `[name].cjs`,
          chunkFileNames: `[name]-[hash].cjs`,
        },
      ],
    },
  },
});
