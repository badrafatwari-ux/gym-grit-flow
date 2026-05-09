import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

// Standalone Vite SPA shell for Capacitor (Android/iOS).
// Writes a static index.html into TanStack Start's client output folder.
// Run: `npm run build` then `npx cap sync`.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "dist/client",
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, "index.mobile.html"),
    },
  },
});
