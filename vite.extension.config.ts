import { defineConfig, loadEnv } from "vite";
import { resolve } from "node:path";

// Brauserilaiendus: npm run build:ext -> extension/dist (laadi Operas/Chrome'is "Load unpacked")
// Seaded võetakse ehitamisel failist .env, et ei peaks midagi laienduse aknasse kleepima.
const env = loadEnv("production", __dirname, "VITE_");

export default defineConfig({
  define: {
    __LEVELUP_DEFAULTS__: JSON.stringify({
      supabaseUrl: env.VITE_SUPABASE_URL ?? "",
      supabaseKey: env.VITE_SUPABASE_ANON_KEY ?? "",
      password: env.VITE_FAMILY_PASSWORD ?? "",
    }),
  },
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
