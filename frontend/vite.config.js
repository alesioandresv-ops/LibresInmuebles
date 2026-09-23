import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false,
  },
  server: {
    port: 5173,
    proxy: {
      "/auth": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/properties": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/inquiries": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/reports": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/moderation": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/legal/templates": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/uploads": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
});