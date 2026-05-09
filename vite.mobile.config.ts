import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

// Standalone Vite SPA build for Capacitor (Android/iOS).
// Outputs a static dist/ with index.html — no SSR, no server functions.
// Run: `npm run build:mobile` then `npx cap sync`.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "index.mobile.html"),
    },
  },
});
