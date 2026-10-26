import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: true,
  },
  {
    entry: { index: "src/iife.ts" },
    format: ["iife"],
    outDir: "dist",
    outExtension: () => ({ js: ".iife.js" }),
    minify: true,
    sourcemap: true,
  },
])
