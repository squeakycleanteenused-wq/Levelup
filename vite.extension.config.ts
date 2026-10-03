import { defineConfig } from "vite";
import { resolve } from "node:path";

// Brauserilaiendus: npm run build:ext -> extension/dist (laadi Operas/Chrome'is "Load unpacked")
export default defineConfig({
  root: "extension",
  publicDir: "public",
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    minify: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "extension/popup.html"),
        offscreen: resolve(__dirname, "extension/offscreen.html"),
        background: resolve(__dirname, "extension/src/background.ts"),
      },
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name].js", assetFileNames: "assets/[name][extname]" },
    },
  },
});
